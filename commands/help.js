var Enmap = require('enmap');
var fs = require('fs');
var discord = require('discord.js')
exports.run = (bot, msg, args) => {

    let embed = new discord.RichEmbed();
    let output = "", invite = "https://discordapp.com/oauth2/authorize?client_id=392081019798421515&scope=bot&permissions=0";
    let categories = ["Rolling", "Compendium Lookup", "Generator", "Utility", "Cards", "Administrative"];

    if(args.length == 0){
        embed.setTitle("Commands")
             .setDescription(`Hey! This is a full list of everything I can do.\n` + 
                             `You can try \`${bot.prefix}help <command>\` to get more info for a command.\n` +
                             `Invite me to your server [here](${invite})!`)
        categories.forEach(category => {
            let fieldOutput = ""
            bot.commands.forEach(command =>{
                (command.help.category == category) ? fieldOutput += `**${command.help.name}** - ${command.help.description}\n` : ""
            })
            embed.addField(category, fieldOutput)
        })
            
    } else{
        bot.commands.forEach(command =>{
            if(command.help.name == args[0].toLowerCase()){
                embed.setTitle(`${(command.help.noPrefix) ? "" : bot.prefix}${command.help.usage}`)
                output = `${command.help.description}\n${command.help.detailedDesc}`;
            }
        })
        if(output != "") embed.setDescription(output); else return msg.channel.send("Command not found.")
    }
    msg.channel.send(embed)
}
module.exports.help = {
    name: "help",
    category: "Misc",
    description: "Help!",
    detailedDesc: "",
    usage: "help [command]"
}