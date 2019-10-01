var RNG = require('../functions/RNGFunctions.js');
exports.run = (bot, msg, args) => {
    try {
        var stat = RNG.rollStats();
        var total = RNG.totalModMessage(RNG.calculateModifier(stat));
        msg.channel.send("Here's your generated statblock: " + stat + "\nHere are your modifiers: " + RNG.calculateModifier(stat) + "\n" + total);
    }
    catch(Error){
        console.log(Error)
    }
}
module.exports.help = {
    name: "rollstats",
    category: "Generator",
    description: "Rolls 6 stats using 4d6, dropping the lowest.",
    detailedDesc: "Shorthand way to do 4d6kh3 with the benefit of determining the stats strength based on sum of the modifiers.",
    usage: "rollstats"
}