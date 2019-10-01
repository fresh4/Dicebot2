var bestiary = require('../functions/loadFunctions.js').loadBestiary();
var lookup = require('../functions/lookupFunctions.js');
exports.run = (bot, msg, args) => {
    try{
        lookup.lookup(bestiary, msg, msg.content.split("monster ")[1])
    }
    catch(Error){
        console.log(Error);
    }
}
module.exports.help = {
    name: "monster",
    category: "Compendium Lookup",
    description: "Looks up the specified monster.",
    detailedDesc: "",
    usage: "monster <name>"
}