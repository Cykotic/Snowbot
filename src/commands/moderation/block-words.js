const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const { replyWithEmbed } = require("../../utils/functions")
const BlockedKeywords = require("../../modals/blockedkeywords");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blocked-words')
        .setDescription('Add or remove blocked words for the specified user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
            .setName('add')
            .setDescription('Add a new blocked word')
            .addStringOption(option =>
                option.setName('word')
                .setDescription('The word to be blocked')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('remove')
            .setDescription('Remove a blocked word')
            .addStringOption(option =>
                option.setName('word')
                .setDescription('The word to be unblocked')
                .setRequired(true)
            )
        ),

    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            const word = interaction.options.getString('word');
            const guildId = interaction.guildId; // Get the guild ID
            const userId = process.env.SNOW_USER_ID;

            if (subcommand === 'add') {
                const existingWord = await BlockedKeywords.findOne({
                    guildId,
                    userId: userId,
                    word
                });
                if (existingWord) {
                    return replyWithEmbed(interaction, `The word "${word}" is already blocked for this guild.`);
                }

                const newBlockedWord = new BlockedKeywords({
                    guildId,
                    userId: userId,
                    word
                });
                await newBlockedWord.save();
                return replyWithEmbed(interaction, `The word "${word}" has been successfully blocked for this guild.`);
            } else if (subcommand === 'remove') {
                const deletedWord = await BlockedKeywords.findOneAndDelete({
                    guildId,
                    word
                });
                if (!deletedWord) {
                    return replyWithEmbed(interaction, `The word "${word}" is not currently blocked for this guild.`);
                }
                return replyWithEmbed(interaction, `The word "${word}" has been successfully unblocked for this guild.`);
            }
        } catch (error) {
            console.error('An error occurred while handling blocked words:', error);
            interaction.reply({
                content: 'An error occurred while processing the command.',
                ephemeral: true
            });
        }
    }
};
