var cardManager = require('../functions/cardsFunctions.js');
var rand = require('../functions/RNGFunctions.js');
exports.run = (bot, msg, args) => {
    var localCards = new Array;

    if(!msg.guild){return msg.channel.send("cannot currently `sdeal` in DMs.")}
        var temp = "";
        if(cardManager.getCardMap(msg.guild.id) == undefined){
            cardManager.setCardMap(msg.guild.id, cardManager.getGlobalCards().slice());
        }
        localCards = cardManager.getCardMap(msg.guild.id);
        
        if(args.length == 0){
            msg.reply("Please specify a number of cards to be dealt.");
            return;
        }
        var numDealt = parseInt(args[0]);
        if(numDealt > localCards.length){
            msg.reply("Not enough cards in the deck. Pick a smaller number or shuffle the deck.");
            return;
        }
        else if(numDealt <= 0){
            msg.reply("Pick a number above 0 silly. (between 1 and 52 inclusive)");
            return;
        }
        for(var i = 0; i < numDealt; i++){
            var randIndex = rand.rand(0,localCards.length);
            temp += "\n" + localCards[randIndex];
            localCards.splice(randIndex, 1);
        }
        msg.reply(temp);
}
module.exports.help = {
    name: "sdeal",
    category: "Cards",
    description: "Deals from persistent standard 52 deck (no jokers). Cards pulled cannot be pulled again until you shuffle.",
    detailedDesc: "The deck is persistent to the server, unlike `deal`.\nAnytime you draw from the sdeal deck, that card cannot be pulled again by anyone on the server until it is shuffled.\nUse the `shuffle` command to shuffle the sdeal deck.",
    usage: "sdeal <number>"
}