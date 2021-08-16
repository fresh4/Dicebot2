var Math = require("mathjs");
exports.badMath = function(bot, msg){
    var message = msg.content.toLowerCase(), result
    if(/*!message.match(/[+\-*\/\^sqrt]/g) || */message.startsWith(bot.prefix)) return
    try{
        result = Math.evaluate(message)
        //if(isNaN(result)) throw error
        //msg.channel.send(result)
    } catch(error){
        return
    }
}