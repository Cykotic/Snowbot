const BlockedKeywords = require("../modals/blockedkeywords");
const Timer = require("../modals/timer")
const {
    EmbedBuilder
} = require("discord.js");

let intervalId = null;

async function removeRolesFromMember(member, roleIds) {
    try {
        await member.roles.remove(roleIds);
        console.log(`Roles removed from member ${member.user.tag}`);
    } catch (error) {
        console.error('Error removing roles:', error);
        throw new Error('An error occurred while removing roles.');
    }
}

async function fetchMember(guild, memberId) {
    try {
        console.log(`Fetching member with ID: ${memberId}`);
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
            console.log(`Blocked word "${blockedWord}" found in message.`);
            return true;
        }
    }
    return false;
}

const replyWithEmbed = (interaction, description, color = "Purple") => {
    console.log('Replying with embed...');
    interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setDescription(description)
            .setColor(color)
        ]
    });
};

const sendEmbedMessage = async (channel, description, username, avatarURL) => {
    console.log('Sending embed message...');
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
