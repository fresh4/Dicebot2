const discord = require('discord.js');
const Enmap = require("enmap");
const fs = require('fs');

const bot = new discord.Client();
const botConfig = require('./botconfig.json');

bot.config = botConfig;
bot.prefix = bot.config.prefix;

let server_info = JSON.parse(fs.readFileSync("./server_info.json", "utf8"));

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

bot.on("ready", () => {

});

bot.on("message", msg => {
    //[-]if a message is received, check if it has a custom prefix. if it doesn't use the botconfig default.
    //[-]set a command to change the prefix only useable by the admin 
    request = msg.content;
});

bot.login(botConfig.token);