var dice = require('../functions/diceFunctions.js')
exports.run = (bot, msg, args) => {

    var diceRegex = new RegExp('(\\d|)+d\\d+', "g");
    try {
        msg.reply(dice.rollDiceFunc(args[0]));
    }
    catch(Error){
        msg.channel.send(`Invalid roll. Try \`${bot.prefix}help roll\` for help.`);
        console.log(Error)
    }
}