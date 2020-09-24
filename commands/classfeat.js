var classes = require('../functions/loadFunctions.js').loadClasses();
var lookup = require('../functions/lookupFunctions.js')
exports.run = (bot, msg, args) => {
    let features = {"feature": []};
    classes.class.forEach(classs => {
        classs.classFeatures.forEach(level => {
            level.forEach(classFeature => {
                if(classFeature.name) features.feature.push({
                    "name": classFeature.name, 
                    "entries": classFeature.entries,
                    "source": classs.name
                    })
            })
        })

        classs.subclasses.forEach(subclass => {
            subclass.subclassFeatures.forEach(level => {
                level.forEach(subclassFeature => {
                    subclassFeature.entries.forEach(feature => {
                        if(feature.type && feature.name) features.feature.push({
                            "name": feature.name, 
                            "entries": feature.entries,
                            "source": `${classs.name} (${subclass.name})`
                        })
                    })
                })
            })
        })
    })

    lookup.lookup(features, msg, args)
}
module.exports.help = {
    name: "classfeat",
    category: "Compendium Lookup",
    description: "Looks up a specified class or subclass feature.",
    detailedDesc: "",
    usage: "classfeat <classfeat>"
}