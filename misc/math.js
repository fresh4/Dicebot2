exports.badMath = function(bot, msg){
    var message = msg.content.toLowerCase();
    if(!message.match(/[+\-*\/]/g) || message.includes(bot.prefix)) return;
    var operandArray = message.match(/[+\-*\/]/g);
    var numberArray = message.split(/[+\-*\/]/g);
    var total = parseFloat(numberArray[0]);
    if(msg.author.bot) return;
    for(var i = 0; i < operandArray.length; i++){
        if(isNaN(numberArray[i]) || isNaN(numberArray[i+1])) return;
        if(operandArray[i] == "+"){
            total += parseFloat(numberArray[i+1]);
        }
        if(operandArray[i] == "-"){
            total -= parseFloat(numberArray[i+1]);
        }
        if(operandArray[i] == "*"){
            total *= parseFloat(numberArray[i+1]);
        }
        if(operandArray[i] == "/"){
            total /= parseFloat(numberArray[i+1]);
        }
    }
    msg.channel.send(total);
}