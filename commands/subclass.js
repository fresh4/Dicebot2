var classes = require('../functions/loadFunctions.js').loadClasses();
var lookup = require('../functions/lookupFunctions.js')
exports.run = (bot, msg, args) => {
    let subclasses = {"subclass": []};
    classes.class.forEach(classs => {
        classs.subclasses.forEach(subclass => {
            subclasses.subclass = subclasses.subclass.concat(subclass)
        })
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