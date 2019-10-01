var roll = require('../functions/tableFunctions.js');
var RNG = require('../functions/RNGFunctions.js');
var names = require('../5eTools/data/names.json');
exports.run = (bot, msg, args) => {
    let output = "Invalid arguments.";
    if(args.length < 1) return msg.channel.send("Specify a race.")
    names.name.forEach(race => {
        if(race.name.toLowerCase() == args[0].toLowerCase()){
            output = ""
            if(args.length == 1){
                let index = RNG.rand(0, race.tables.length)
                output = roll.rollTable(race.tables[index].table, race.tables[index].diceType)
            } else if(args.length == 2){
                if(args[1].toLowerCase() == "list"){
                    for(let j = 0; j < 10; j++){
                        let index = RNG.rand(0, race.tables.length)
                        output += roll.rollTable(race.tables[index].table, race.tables[index].diceType) +"\n"
                    }
                }
            } else if(args.length == 3){
            }
            msg.channel.send(output)
        }
    })
        
}
module.exports.help = {
    name: "name",
    category: "Generator",
    description: "Generates a random name based on the specified race.",
    detailedDesc: "Uses race and gender specific names.\nUsing with only the <race> argument rolls a name of that race from a random gender.\nUsing only the <race> and <gender> arguments will generate a random name of the specified gender of that race.\nUsing only the <race> and <list> arguments will generate and list 10 random names of the specified race of a random gender.\nUsing the <race> <gender> and <list> arguments will generate and list 10 random names of the specified gender and race.",
    usage: "name <race> [male|female|list] [list]"
}