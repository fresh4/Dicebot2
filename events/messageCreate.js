const fs = require('fs');
module.exports = (bot, msg) => {
    
    if(msg.author.bot) return;
    try{
        bot.prefix = JSON.parse(fs.readFileSync("./server_info.json", "utf8"))[msg.guild.id].prefix[0];
    }catch(Error){
        bot.prefix = bot.config.prefix
    }

    const prefixMention = new RegExp(`^<@!?${bot.user.id}> `);
    const prefix = msg.content.match(prefixMention) ? msg.content.match(prefixMention)[0] : bot.prefix;

    //No Prefix Stuff
    if(msg.content.includes("[[") || msg.content.includes("]]")) bot.commands.get("inlineroll").run(bot, msg);
    require('../misc/eggs.js').eastereggs(bot, msg);
    require('../misc/math.js').badMath(bot, msg);
    //End NOPREFIX

    if (msg.content.indexOf(prefix) !== 0) return;
    let args = msg.content.toLowerCase().slice(prefix.length).trim().split(/ +/g);
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