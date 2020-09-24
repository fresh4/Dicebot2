var classes = require('../functions/loadFunctions.js').loadClasses();
var subclassFeatures = require('../functions/loadFunctions.js').loadSubclassFeatures()
var lookup = require('../functions/lookupFunctions.js')
exports.run = (bot, msg, args) => {
    let subclasses = {"subclass": []};
    subclassFeatures.subclassfeatures.forEach(feature => {
        if(feature) subclasses.subclass.push(feature)
    })
    lookup.lookup(subclasses, msg, args)
}
module.exports.help = {
    name: "subclass",
    category: "Compendium Lookup",
    description: "Looks up a specified subclass.",
    detailedDesc: "",
    usage: "subclass <subclass>"
}