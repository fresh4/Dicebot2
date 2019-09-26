var spellBook = require('../functions/loadFunctions.js').loadSpells();
var lookup = require('../functions/lookupFunctions.js');
exports.run = (bot, msg, args) => {
    try{
        lookup.lookup(spellBook, msg, msg.content.split("spell ")[1])
    }
    catch(Error){
        console.log(Error);
    }
}

