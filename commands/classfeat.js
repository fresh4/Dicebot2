var classes = require('../functions/loadFunctions.js').loadClassFeatures();
var subclasses = require('../functions/loadFunctions.js').loadSubclassFeatures();
var lookup = require('../functions/lookupFunctions.js')
exports.run = (bot, msg, args) => {
    let features = {"feature": []};
    classes.classfeatures.forEach(feature =>{
        features.feature.push(feature)
    })
    subclasses.subclassfeatures.forEach(feature =>{
        if(feature) features.feature.push(feature)
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