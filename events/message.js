const fs = require('fs');
module.exports = (bot, msg) => {
    
    if(msg.author.bot) return;
    try{
        bot.prefix = JSON.parse(fs.readFileSync("./server_info.json", "utf8"))[msg.guild.id].prefix[0];
    }catch(Error){
        bot.prefix = bot.config.prefix
    }
    //No Prefix Stuff
    if(msg.content.includes("[[") || msg.content.includes("]]")) bot.commands.get("inlineroll").run(bot, msg);
    //End NOPREFIX
    if (msg.content.indexOf(bot.prefix) !== 0) return;
    let args = msg.content.slice(bot.prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();
    let cmd = bot.commands.get(command);
    //Special cases...
    if(command.match(new RegExp('(\\d|)+d\\d+', "g"))) {
        args[0] = command;
        cmd = bot.commands.get("roll");
    } else if(command == "r") cmd = bot.commands.get("roll");
    if(command == "rr") cmd = bot.commands.get("multiroll");
    //End Special Cases
    if (!cmd) return;
    cmd.run(bot, msg, args);
}