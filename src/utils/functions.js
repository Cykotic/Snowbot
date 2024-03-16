const BlockedKeywords = require("../modals/blockedkeywords");
const {
    EmbedBuilder
} = require("discord.js");

async function removeRolesFromMember(member, roleIds) {
    try {
        await member.roles.remove(roleIds);
    } catch (error) {
        console.error('Error removing roles:', error);
        throw new Error('An error occurred while removing roles.');
    }
}

async function fetchMember(guild, memberId) {
    try {
        return await guild.members.fetch(memberId);
    } catch (error) {
        console.error('Error fetching member:', error);
        throw new Error('An error occurred while fetching the member.');
    }
}

async function checkBlockedWords(message, userId) {
    if (!message.guild) return false;

    const blockedWords = await BlockedKeywords.find({
        userId,
        guildId: message.guild.id
    });
    if (!blockedWords || blockedWords.length === 0) return false;

    const content = message.content.toLowerCase();

    for (const wordObj of blockedWords) {
        const blockedWord = wordObj.word.toLowerCase();

        if (content.includes(blockedWord)) {
            return true;
        }
    }
    return false;
}

const replyWithEmbed = (interaction, description, color = "Purple") => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setDescription(description)
            .setColor(color)
        ]
    });
};

const sendEmbedMessage = async (channel, description, username, avatarURL) => {
    const embed = new EmbedBuilder()
        .setDescription(description)
        .setColor("Purple")
        .setFooter({
            text: username,
            iconURL: avatarURL
        })
        .setTimestamp();

    await channel.send({
        embeds: [embed],
        ephemeral: true
    });
};

module.exports = {
    removeRolesFromMember,
    fetchMember,
    checkBlockedWords,
    replyWithEmbed,
    sendEmbedMessage,
};
