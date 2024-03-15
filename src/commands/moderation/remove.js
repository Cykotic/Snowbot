const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Timer = require("../../modals/timer");
const { removeRolesFromMember, fetchMember } = require("../../utils/functions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-snows-roles')
        .setDescription('Remove specific roles from a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('time_limit')
            .setDescription('Select the time limit for roles to be added back')
            .setRequired(true)
            .addChoices(
                { name: "30 seconds", value: "30" },
                { name: "1 minute", value: "60" },
                { name: "5 minutes", value: "300" },
                { name: "15 minutes", value: "900" },
                { name: "30 minutes", value: "1800" },
                { name: "45 minutes", value: "2700" },
                { name: "1 hour", value: "3600" }
            )
        ),
    async execute(interaction, client) {
        const timeLimit = parseInt(interaction.options.getString('time_limit'));

        try {
            const guild = interaction.guild;
            const userId = process.env.SNOW_USER_ID;

            if (!guild.members.cache.has(userId)) {
                throw new Error("User not found in this guild.");
            }

            const member = await fetchMember(guild, userId);
            const roleIdsToRemove = process.env.ROLE_IDS_TO_REMOVE.split(',').map(id => id.trim()); // Trim whitespace

            await removeRolesFromMember(member, roleIdsToRemove);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`Roles removed from <@${userId}>.`)
                    .setColor("Purple")
                    .setFooter({
                        text: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp(),
                ],
                ephemeral: true
            });

            const timer = new Timer({
                userId: userId,
                endTime: new Date(Date.now() + timeLimit * 1000),
                roleIdsToAdd: roleIdsToRemove
            });
            await timer.save();

            setTimeout(async () => {
                await member.roles.add(roleIdsToRemove);
                await Timer.deleteOne({
                    userId: userId
                });
            }, timeLimit * 1000);
        } catch (error) {
            console.error('An error occurred:', error);
            interaction.reply({
                content: error.message || 'An unknown error occurred.',
                ephemeral: true
            });
        }
    }
};
