var backgrounds = require('../5eTools/data/backgrounds.json')
var lookup = require('../functions/lookupFunctions.js')
exports.run = (bot, msg, args) => {
    lookup.lookup(backgrounds, msg, args)
}
module.exports.help = {
    name: "background",
    category: "Compendium Lookup",
    description: "Looks up a specified background.",
    detailedDesc: "",
    usage: "background <name>"
}