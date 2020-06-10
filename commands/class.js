var classes = require('../functions/loadFunctions.js').loadClasses();
var lookup = require('../functions/lookupFunctions.js')
exports.run = (bot, msg, args) => {
    lookup.lookup(classes, msg, args)
}
module.exports.help = {
    name: "class",
    category: "Compendium Lookup",
    description: "Looks up a specified class.",
    detailedDesc: "",
    usage: "class <class> [subclass]"
}