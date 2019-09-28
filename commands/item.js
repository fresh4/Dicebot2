var items = require('../functions/loadFunctions.js').loadItems();
var lookup = require('../functions/lookupFunctions.js');
exports.run = (bot, msg, args) => {
    try{
        lookup.lookup(items, msg, msg.content.split("item ")[1])
    }
    catch(Error){
        console.log(Error);
    }
}
