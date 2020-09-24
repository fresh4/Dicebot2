var races = require('../5eTools/data/races.json')
var lookup = require('../functions/lookupFunctions.js')
exports.run = (bot, msg, args) => {
    try{
        let allRaces = {race: []};

        if(args[0])
            lookup.lookup(races, msg, args)
    }
    catch(error){
        console.log(error)
    }
}
module.exports.help = {
    name: "race",
    category: "Compendium Lookup",
    description: "Looks up the specified race.",
    detailedDesc: "",
    usage: "race <name>"
}