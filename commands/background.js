var backgrounds = require('../5eTools/data/backgrounds.json')
var lookup = require('../functions/lookupFunctions.js')
exports.run = (bot, msg, args) => {
    lookup.lookup(backgrounds, msg, msg.content.split("background ")[1])
}
module.exports.help = {
    name: "background",
    category: "Compendium Lookup",
    description: "Looks up a specified background.",
    detailedDesc: "",
    usage: "background <name>"
}