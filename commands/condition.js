var fs = require('fs');
var data = JSON.parse(fs.readFileSync('./5eTools/data/conditionsdiseases.json'));
exports.run = (bot, msg, args) => {
    try {
        var description = "", conditionsData = data;
        for(var i = 0; i < conditionsData.condition.length; i++){
            if(args[0] == conditionsData.condition[i].name.toLowerCase()){
                if(conditionsData.condition[i].entries[0].type == "list")
                    for(var j = 0; j < conditionsData.condition[i].entries[0].items.length; j++)
                        description += conditionsData.condition[i].entries[0].items[j] + "\n";
                else
                    for(var j = 0; j < conditionsData.condition[i].entries.length; j++)
                        description += conditionsData.condition[i].entries[j] + "\n";
                msg.channel.send({embed:{
                    title: conditionsData.condition[i].name,
                    description: description
                }});
            }
        }
    }
    catch(Error){
        console.log(Error)
    }
}