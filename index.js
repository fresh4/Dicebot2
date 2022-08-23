const discord = require('discord.js');
const Enmap = require("enmap");
const fs = require('fs');

global.__basedir = __dirname

const dicebotIntents = new discord.Intents().add(discord.Intents.FLAGS.DIRECT_MESSAGES)
    .add(discord.Intents.FLAGS.GUILDS)
    .add(discord.Intents.FLAGS.GUILD_MEMBERS)
    .add(discord.Intents.FLAGS.GUILD_MESSAGES)
    .add(discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS);
const bot = new discord.Client({ intents: dicebotIntents });
const botConfig = require('./botconfig.json');

bot.config = botConfig;
bot.prefix = bot.config.prefix;

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        bot.on(eventName, event.bind(null, bot));
    });
});

bot.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        bot.commands.set(commandName, props);
    });
});

bot.login(botConfig.token);