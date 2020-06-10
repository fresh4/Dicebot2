var spellBook = require('../functions/loadFunctions.js').loadSpells();
var lookup = require('../functions/lookupFunctions.js');
exports.run = (bot, msg, args) => {
    try{
        lookup.lookup(spellBook, msg, args)
    }
    catch(Error){
        console.log(Error);
    }
}
module.exports.help = {
    name: "spell",
    category: "Compendium Lookup",
    description: "Looks up the specified spell.",
    detailedDesc: "",
    usage: "spell <name>"
}