var classes = require('../functions/loadFunctions.js').loadClasses();
var lookup = require('../functions/lookupFunctions.js')
exports.run = (bot, msg, args) => {
    lookup.lookup(classes, msg, args)
}
module.exports.help = {
    name: "class",
    category: "Compendium Lookup",
    description: "Looks up a specified class.",
    detailedDesc: "A list of available subclasses will be listed; use `subclass` command to look up a subclass.",
    usage: "class <class>"
}