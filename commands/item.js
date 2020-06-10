var items = require('../functions/loadFunctions.js').loadItems();
var lookup = require('../functions/lookupFunctions.js');
exports.run = (bot, msg, args) => {
    try{
        lookup.lookup(items, msg, args)
    }
    catch(Error){
        console.log(Error);
    }
}
module.exports.help = {
    name: "item",
    category: "Compendium Lookup",
    description: "Looks up the specified item.",
    detailedDesc: "",
    usage: "item <name>"
}