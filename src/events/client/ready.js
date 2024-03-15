const { ActivityType, Events } = require('discord.js');
const chalk = require('chalk');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const userToWatch = await client.users.fetch(process.env.SNOW_USER_ID);

        // Set presence to watch the specific user
        await client.user.setPresence({
            activities: [{
                name: `@${userToWatch.username}`,
                type: ActivityType.Watching
            }],
            status: "dnd"
        });

        console.log(chalk.white(`[${chalk.blueBright("CLIENT")}]${chalk.white(" - ")}Connected to ${client.user.username}, started in ${client.guilds.cache.size} guild(s)`));
        console.log(" ");
    }
}
