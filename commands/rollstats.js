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