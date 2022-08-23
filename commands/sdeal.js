var cardManager = require('../functions/cardsFunctions.js');
var rand = require('../functions/RNGFunctions.js');
exports.run = (bot, msg, args) => {
    var localCards = new Array;

    if (!msg.guild) { return msg.channel.send("cannot currently `sdeal` in DMs.") }
    var temp = "";
    if (cardManager.getCardMap(msg.channel.id) == undefined) {
        cardManager.setCardMap(msg.channel.id, cardManager.getGlobalCards().slice());
    }
    localCards = cardManager.getCardMap(msg.channel.id);

    if (args.length == 0) {
        msg.reply("Please specify a number of cards to be dealt.");
        return;
    }
    else if (args[0] == "-d") {
        //draw the cards
        cardManager.drawCards(msg.channel.id, args.slice(1))
        return msg.reply("Specified cards removed from deck.")
    }
    else if (args[0] == "-i") {
        //insert cards
        cardManager.insertCards(msg.channel.id, args.slice(1))
        return msg.reply("Specified cards returned to deck.")
    }
    else if (args[0] == "list") {
        //print all drawn cards
        let drawn = cardManager.cards.filter((e) => !localCards.includes(e)).toString();
        return msg.reply(`Currently drawn cards: ${drawn}`) //TODO: Format this
    }
    var numDealt = parseInt(args[0]);
    if (numDealt > localCards.length) {
        msg.reply("Not enough cards in the deck. Pick a smaller number or shuffle the deck.");
        return;
    }
    else if (numDealt <= 0) {
        msg.reply("Pick a number above 0 silly. (between 1 and 52 inclusive)");
        return;
    }
    // cardManager.drawCard(numDealt)
    for (var i = 0; i < numDealt; i++) {
        var randIndex = rand.rand(0, localCards.length); //pick a card
        temp += "\n" + localCards[randIndex]; //add to message
        localCards.splice(randIndex, 1); //remove it from array
        cardManager.setCardMap(msg.channel.id, localCards); //set json to new array

    }
    msg.reply(temp);
}
module.exports.help = {
    name: "sdeal",
    category: "Cards",
    description: "Deals from persistent standard 52 deck (no jokers). Cards pulled cannot be pulled again until you shuffle.",
    detailedDesc: "The deck is persistent to the channel it's used in, unlike `deal`.\nAnytime you draw from the sdeal deck, that card cannot be pulled again by anyone in the channel until it is shuffled.\nUse the `shuffle` command to shuffle the sdeal deck.",
    usage: "sdeal <number>"
}