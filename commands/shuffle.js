var cardManager = require('../functions/cardsFunctions.js');
exports.run = (bot, msg, args) => {
    cardManager.setCardMap(msg.guild.id, cardManager.getGlobalCards().slice())
    msg.channel.send("Cards shuffled back into deck.")
    return;
}
module.exports.help = {
    name: "shuffle",
    category: "Cards",
    description: "Shuffles the sdeal deck, resetting the cards that have been pulled."
}