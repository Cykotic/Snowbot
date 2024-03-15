const Timer = require("../../modals/timer");
const {
    removeRolesFromMember,
    fetchMember,
    checkBlockedWords,
    sendEmbedMessage
} = require("../../utils/functions");

let intervalId = null;

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        try {

            if (!message.guild || message.author.bot) return;

            const userId = process.env.SNOW_USER_ID;
            if (message.author.id !== userId) return;

            const isBlockedWordUsed = await checkBlockedWords(message, userId);
            if (!isBlockedWordUsed) return;

            const guild = message.guild;
            if (!guild.members.cache.has(userId)) {
                throw new Error("User not found in this guild.");
            }

            const member = await fetchMember(guild, userId);
            const roleIdsToRemove = process.env.ROLE_IDS_TO_REMOVE.split(',').map(id => id.trim());
            await removeRolesFromMember(member, roleIdsToRemove);

            let timeLimit = 300000;
            let embedDescription = `Roles removed from <@${userId}>.`;

            const existingTimer = await Timer.findOne({
                userId: userId
            });
            if (existingTimer) {
                // Update the stored timeLimit by 1 minute
                timeLimit = existingTimer.timeLimit + 60000;
                embedDescription = `1 minute has been added for your roles, <@${userId}>.`;
                await Timer.findOneAndUpdate({
                    userId: userId
                }, {
                    endTime: new Date(Date.now() + timeLimit),
                    timeLimit: timeLimit,
                    roleIdsToAdd: roleIdsToRemove
                });
            } else {
                await new Timer({
                    userId: userId,
                    endTime: new Date(Date.now() + timeLimit),
                    timeLimit: timeLimit,
                    roleIdsToAdd: roleIdsToRemove
                }).save();
            }

            await sendEmbedMessage(message.channel, embedDescription, message.author.username, message.author.displayAvatarURL());

            if (intervalId) {
                clearInterval(intervalId);
            }

            intervalId = setInterval(async () => {
                const timer = await Timer.findOne({
                    userId: userId
                });
                if (!timer || new Date() > timer.endTime) {
                    await member.roles.add(roleIdsToRemove);
                    await Timer.deleteOne({
                        userId: userId
                    });
                    clearInterval(intervalId);
                }
            }, 60000); // Check every minute
        } catch (error) {
            console.error('An error occurred:', error);
            message.channel.send(error.message || 'An unknown error occurred.');
        }
    }
};
