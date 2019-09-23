const discord = require('discord.js');
var fs = require('fs');
var data = JSON.parse(fs.readFileSync('./5eTools/data/conditionsdiseases.json'));
exports.run = (bot, msg, args) => {
    try {
        var description = "", conditionsData = data;
        const embeddedMessage = new discord.RichEmbed()
        for(var i = 0; i < conditionsData.condition.length; i++){
            let condition = conditionsData.condition[i];

            if(args[0] == condition.name.toLowerCase()){
                if(condition.entries[0].type == "list")
                    condition.entries[0].items.forEach(item => {
                        description += item;
                    });
                else
                    condition.entries.forEach(entry =>{
                        description += `${entry}\n`
                    });
                return msg.channel.send(embeddedMessage.setTitle(condition.name)
                                                       .setDescription(description)
                                                       .setColor(3447003));
            }
        }
        msg.channel.send("Condition not found.")
    }
    catch(Error){
        console.log(Error)
    }
}