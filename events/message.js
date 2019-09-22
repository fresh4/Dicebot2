const fs = require('fs');
module.exports = (bot, msg) => {
    
    var prefix;    
    if(msg.author.bot) return;
    try{
        prefix = JSON.parse(fs.readFileSync("./server_info.json", "utf8"))[msg.guild.id].prefix[0];
    }catch(Error){
        prefix = bot.config.prefix
    }
    if (msg.content.indexOf(prefix) !== 0) return;
    const args = msg.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = bot.commands.get(command);
    if (!cmd) return;
    cmd.run(bot, msg, args);
}