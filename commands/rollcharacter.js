var RNG = require('../functions/RNGFunctions.js');
exports.run = (bot, msg, args) => {
    try {
        //momentarily depreciated due to redundancy with rollstats. 
        //Intend to merge the rollcharacter and backstory commands and improve upon them.
    }
    catch(Error){
        console.log(Error)
    }
}
module.exports.help = {
    name: "rollcharacter",
    category: "Generator",
    description: "Rolls a character of a race and class.",
    detailedDesc: "Incomplete command.",
    usage: "rollcharacter [race] [class]"
}