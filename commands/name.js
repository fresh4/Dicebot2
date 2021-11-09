var roll = require('../functions/tableFunctions.js');
var RNG = require('../functions/RNGFunctions.js');
var names = require('../5eTools/data/names.json');
exports.run = (bot, msg, args) => {
    //args 0: race. args 1: gender/list. args 2: list
    let output = "Invalid arguments.";
    if(args.length < 1) return msg.channel.send("Specify a race.")
    names.name.forEach(race => {
        if(race.name.toLowerCase() == args[0].toLowerCase()){
            race = race.tables
            if(args.length == 1){
                output = generateList(race, 1)
            } 
            else if(args.length == 2){
                if(args[1].toLowerCase() == "list"){
                    output = generateList(race, 10)
                }
                else {
                    var table = selectGenderTable(race, args[1].toLowerCase())
                    output = generateList(table, 1)    
                }
            } 
            else if(args.length == 3 && args[2].toLowerCase() == "list"){
                var table = selectGenderTable(race, args[1].toLowerCase())
                output = generateList(table, 10)
            }
        }
    })
    msg.channel.send(output)
}
function selectGenderTable(race, gender) {
    if(gender == "female") gender = "Female"
    else if (gender == "male") gender == "Male"
    return race.filter(type => type.option.includes(gender))
}
function generateList(race, length){
    let output = ""
    for(let j = 0; j < length; j++){
        let index = RNG.rand(0, race.length)
        output += roll.rollTable(race[index].table, race[index].diceType) +"\n"
    }
    return output
}
module.exports.help = {
    name: "name",
    category: "Generator",
    description: "Generates a random name based on the specified race.",
    detailedDesc: "Uses race and gender specific names.\nUsing with only the <race> argument rolls a name of that race from a random gender.\nUsing only the <race> and <gender> arguments will generate a random name of the specified gender of that race.\nUsing only the <race> and <list> arguments will generate and list 10 random names of the specified race of a random gender.\nUsing the <race> <gender> and <list> arguments will generate and list 10 random names of the specified gender and race.",
    usage: "name <race> [male|female|list] [list]"
}