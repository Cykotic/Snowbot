const ownerId = process.env.OwnersId;
const { EmbedBuilder } = require("discord.js");
const mainSchema = require("../../modals/maintenance");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            if (interaction.isCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;

                // Owner check
                if (command.ownerId && !ownerId.includes(interaction.user.id)) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setDescription(`Only The **"Bot Owner"** can use this command`)
                            .setColor("Orange")
                        ],
                        ephemeral: true
                    });
                }

                // Maintenance checks
                const dataMain = await mainSchema.findOne({ Type: "Main" });
                const maintenance = !!dataMain;

                if (maintenance && !ownerId.includes(interaction.user.id)) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setDescription(`${client.user.username} is currently under maintenance!`)
                            .setColor(0xff6464)
                        ],
                        ephemeral: true
                    });
                }
                
                // Execute the command
                await command.execute(interaction, client);
            }
        } catch (error) {
            console.log(error);
        }
    }
};
