const fs = require('fs');
exports.run = (bot, msg, args) => {
    if(!msg.member.hasPermission("ADMINISTRATOR")){return msg.reply("You don't have permission to access this command.")}
    let prefix = JSON.parse(fs.readFileSync("./server_info.json", "utf8"));
    prefix[msg.guild.id] = {prefix:args};
    fs.writeFileSync("./server_info.json", JSON.stringify(prefix, null));
    serverConfig = require('../server_info.json');
    bot.prefix = prefix;
    msg.channel.send(`Server's prefix is now ${bot.prefix}`);
}
module.exports.help = {
    name: "setprefix",
    category: "Administrative",
    description: "Sets the prefix for the server. Can only be used by an administrator.",
    detailedDesc: "",
    usage: "setprefix <prefix>"
}