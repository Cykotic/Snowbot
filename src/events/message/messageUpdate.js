const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
const Timer = require("../../modals/timer");
const {
    removeRolesFromMember,
    fetchMember,
    checkBlockedWords
} = require("../../utils/functions");

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        try {
            if (!newMessage.guild || newMessage.author.bot) return;

            const userId = process.env.SNOW_USER_ID;
            if (newMessage.author.id !== userId) return;

            const isBlockedWordUsed = await checkBlockedWords(newMessage, userId);
            if (!isBlockedWordUsed) return;

            const guild = newMessage.guild;
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
                timeLimit = existingTimer.endTime.getTime() - Date.now() + 60000;
                embedDescription = `1 minute has been added for your roles, <@${userId}>.`;
                await Timer.findOneAndUpdate({
                    userId: userId
                }, {
                    endTime: new Date(Date.now() + timeLimit),
                    roleIdsToAdd: roleIdsToRemove
                });
            } else {
                await new Timer({
                    userId: userId,
                    endTime: new Date(Date.now() + timeLimit),
                    roleIdsToAdd: roleIdsToRemove
                }).save();
            }

            await newMessage.channel.send({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(embedDescription)
                    .setColor("Purple")
                    .setFooter({
                        text: newMessage.author.username,
                        iconURL: newMessage.author.displayAvatarURL()
                    })
                    .setTimestamp(),
                ]
            });

            setTimeout(async () => {
                await member.roles.add(roleIdsToRemove);
                await Timer.deleteOne({
                    userId: userId
                });
            }, timeLimit);
        } catch (error) {
            console.error('An error occurred:', error);
            newMessage.channel.send(error.message || 'An unknown error occurred.');
        }
    }
};
