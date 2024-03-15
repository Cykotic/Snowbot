const fs = require('node:fs');
const chalk = require('chalk');
// const eventFiles = fs.readdirSync('./src/events').filter(f => f.endsWith('.js'));

async function events(client) {
    const folders = fs.readdirSync('./src/events');
    for (const folder of folders) {
        const files = fs.readdirSync(`./src/events/${folder}`).filter((file) => file.endsWith(".js"));

        for (const file of files) {
            const event = require(`../events/${folder}/${file}`);

            // LOGGING
            if (!event.name) {
                console.log(chalk.white(`[${chalk.red("EVENTS")}]${chalk.white(" - ")}Event at ${chalk.grey(`${file}`)} is missing a name or has an invalid name`))
            } else {
                console.log(chalk.white(`[${chalk.green("EVENTS")}]${chalk.white(" - ")}Loaded ${event.name}`))
            }

            // EXECUTING
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client))
            } else {
                client.on(event.name, (...args) => event.execute(...args, client))
            }
        }
    }
    console.log(" ")
}

module.exports = events;