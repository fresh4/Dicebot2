var roll = require('../functions/tableFunctions.js');
var names = require('../5eTools/data/names.json');
exports.run = (bot, msg, args) => {
    if(args.length < 1) return msg.channel.send("Specify a race.")
    for(i in names.name){
        if(names.name[i].name.toLowerCase() == args[0].toLowerCase()){
            //Case 1: One argument (race) | Pick a random gender and roll on that table
            //Case 2: Two arguments (race gender/other*)
            //Case 3: Two arguments (race list)
            //Case 4: Three arguments (race gender/other* list)
            //*Other includes family, clan, etc.
            //Currently just rolls on the 0th table
            msg.channel.send(roll.rollTable(names.name[i].tables[0].table, names.name[i].tables[0].diceType))
        }
    }
}
module.exports.help = {
    name: "name",
    category: "Generator",
    description: "Generates a random name based on the specified race."
}