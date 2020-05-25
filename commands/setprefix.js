const fs = require('fs');
exports.run = (bot, msg, args) => {
    if(!msg.member.hasPermission("ADMINISTRATOR") || msg.member.id != bot.config.owner) return msg.reply("You don't have permission to access this command.")
    if(args.length != 1) return msg.channel.send(`Invalid arguments. See \`${bot.prefix}help setprefix\``)

    let prefix = JSON.parse(fs.readFileSync("./server_info.json", "utf8"));
    prefix[msg.guild.id] = {prefix:args};

    fs.writeFileSync("./server_info.json", JSON.stringify(prefix, null));
    serverConfig = require('../server_info.json');
    bot.prefix = prefix[msg.guild.id].prefix;
    
    msg.channel.send(`Server's prefix is now ${bot.prefix}`);
}
module.exports.help = {
    name: "setprefix",
    category: "Administrative",
    description: "Sets the prefix for the server. Can only be used by an administrator.",
    detailedDesc: "Must have exactly 1 argument. For example `!setprefix ~` or `!setprefix //`. `!setprefix ` or `!setprefix two words` are not valid. \nIf you've forgotten your prefix you can change it with `@Dicebot setprefix !`",
    usage: "setprefix <prefix>"
}