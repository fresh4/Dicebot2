var dice = require('../functions/diceFunctions.js')
exports.run = (bot, msg, args) => {
    try {
        if(args.length != 2){
            msg.channel.send(`Invalid syntax for multiroll (remember the space). Syntax is ${bot.prefix}rr [number of iterations] [dice roll to iterate], ie (${bot.prefix}rr 6 d20+6)`);
            return;
        }
        var loopCount = parseInt(args[0]), totalIterations = "\n";
        for(var i = 0; i < loopCount; i++){
            totalIterations += `${args[1]}: ${dice.rollDiceFunc(args[1])}\n`
        }
        msg.channel.send(`Rolling ${loopCount} iterations: ${totalIterations}`);
    }
    catch(Error){
        msg.channel.send(`Invalid roll. Try \`${bot.prefix}help roll\` for help.`);
        console.log(Error)
    }
}
module.exports.help = {
    name: "multiroll",
    category: "Rolling",
    description: "Iterate a specific roll some number of times, for when you need to roll a *lot* of attacks.",
    detailedDesc: "can be called with `multiroll` or `rr` command.\nRemember the space between the iterator and the dice. Example: `rr 2 d20` or `rr 6 4d6`",
    usage: "rr <number of times to reroll> <dice to roll>"
}