const discord = require('discord.js');
var parse = require('../functions/parseFunctions.js');
var data = require('../5eTools/data/conditionsdiseases.json');
exports.run = (bot, msg, args) => {
    try {
        var description = "", conditionsData = data;
        const embeddedMessage = new discord.MessageEmbed()
        for(var i = 0; i < conditionsData.condition.length; i++){
            let condition = conditionsData.condition[i];
            if(args[0] == condition.name.toLowerCase()){
                if(condition.entries[0].type == "list")
                    condition.entries[0].items.forEach(item => {
                        description += `• ${item}\n`;
                    });
                else
                    condition.entries.forEach(entry =>{
                        description += `${entry}\n`
                    });
                return msg.channel.send(embeddedMessage.setTitle(condition.name)
                                                       .setDescription(parse.removeTags(description))
                                                       .setColor(3447003));
            }
        }
        msg.channel.send("Condition not found.")
    }
    catch(Error){
        console.log(Error)
    }
}

module.exports.help = {
    name: "condition",
    category: "Compendium Lookup",
    description: "Looks up a specified condition.",
    detailedDesc: "",
    usage: "condition <name>"
}