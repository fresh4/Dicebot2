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
module.exports.help = {
    name: "roll",
    category: "Rolling",
    description: "Rolls some dice.",
    detailedDesc: "Standard dice rolling can be done in one of three ways. Simple way, just use the dice after the prefix (eg !d20), or using roll|r command specifier.\n~~You can specify advantage or disadvantage on d20 rolls using the following format: `d20adv+[modifier|dice]` or `d20dis+[modifier|dice]`~~ Depreciated for now\nYou can also go further and keep a number of dice using `kh` or `kl` notation. For example `4d6kh3` will keep the highest three rolls. `2d20kl1` will keep the lowest roll.",
    usage: "r|roll [number of dice]d<number of sides>[+|-]...[modifier|dice]"
}