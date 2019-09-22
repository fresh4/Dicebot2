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