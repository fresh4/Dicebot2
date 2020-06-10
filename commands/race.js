var races = require('../5eTools/data/races.json')
var lookup = require('../functions/lookupFunctions.js')
exports.run = (bot, msg, args) => {
    try{
        let allRaces = {race: []};
        /*races.race.forEach(race => {
            if(race.subraces){
                let index = 0;
                for(let i in race.subraces){
                    if(race.subraces[i].name) {
                        allRaces.race.push(race)
                        allRaces.race[i].subrace = race.subraces[i]
                        //console.log(allRaces.race[i].subraces)
                        //allRaces.race[i].name = `${race.name} (${race.subraces[i].name})`
                    }
                }

            } else allRaces.race.push(race)
        })*/

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