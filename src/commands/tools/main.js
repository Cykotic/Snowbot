const {
    SlashCommandBuilder
} = require("discord.js")
const maintenance = require("../../modals/maintenance");

module.exports = {
    ownerId: true,
    data: new SlashCommandBuilder()
        .setName('maintenance')
        .setDescription('Enable or disable maintenance mode.')
        .addStringOption(option =>
            option.setName('action')
            .setDescription('Enable or disable maintenance mode.')
            .setRequired(true)
            .addChoices({
                name: "Enable",
                value: "enable"
            }, {
                name: "Disable",
                value: "disable"
            })
        ),
    async execute(interaction) {

        const action = interaction.options.getString('action');

        try {
            if (action === 'enable') {
                const data = await maintenance.findOne({
                    Type: "Main"
                });
                if (data) {
                    return interaction.reply({
                        content: "Maintenance is already online!",
                        ephemeral: true
                    });
                } else {
                    await maintenance.create({
                        Type: "Main"
                    });
                    await interaction.reply({
                        content: "Maintenance enabled, you can code now!",
                        ephemeral: true
                    });
                    console.log("Maintenance: Enabled");
                }
            } else if (action === 'disable') {
                const data = await maintenance.findOne({
                    Type: "Main"
                });
                if (data) {
                    await maintenance.deleteMany({
                        Type: "Main"
                    });
                    await interaction.reply({
                        content: "Maintenance has been disabled!",
                        ephemeral: true
                    });
                    console.log("Maintenance: Disabled");
                } else {
                    await interaction.reply({
                        content: "Maintenance is already disabled!",
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while processing your request.',
                ephemeral: true
            });
        }
    },
};