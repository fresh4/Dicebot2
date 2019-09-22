const fs = require('fs');
let serverConfig = require('../server_info.json');
exports.run = (bot, msg, args) => {
    if(!msg.member.hasPermission("ADMINISTRATOR")){return msg.reply("You don't have permission to access this command.")}
    let prefix = JSON.parse(fs.readFileSync("./server_info.json", "utf8"));
    prefix[msg.guild.id] = {prefix:args};
    fs.writeFileSync("./server_info.json", JSON.stringify(prefix, null));
    serverConfig = require('../server_info.json');
}