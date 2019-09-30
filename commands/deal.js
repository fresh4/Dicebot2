var cardHandler = require('../functions/cardsFunctions.js');
var rand = require('../functions/RNGFunctions.js')
exports.run = (bot, msg, args) => {
    var temp = "";
    var tempCardsArray = cardHandler.getCards().slice();
    if(args.length == 0){
        msg.channel.send("Please specify a number of cards to be dealt.");
        return;
    }
    var numDealt = parseInt(args[0]);
    if(numDealt > tempCardsArray.length){
        msg.channel.send("Not enough cards in the deck. Pick a smaller number");
        return;
    }
    else if(numDealt <= 0){
        msg.channel.send("Pick a number above 0 silly. (between 1 and 52 inclusive)");
        return;
    }
    for(var i = 0; i < numDealt; i++){
        var randIndex = rand.rand(0,tempCardsArray.length);
        temp += "\n" + tempCardsArray[randIndex];
        tempCardsArray.splice(randIndex, 1);
    }
    msg.reply(temp);
}
module.exports.help = {
    name: "deal",
    category: "Cards",
    description: "Deals the specified number of cards from a standard 52 deck (no jokers)."
}