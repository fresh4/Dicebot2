var time = require('../functions/timeFunctions.js');
var fs = require('fs');
exports.run = (bot, msg, args) => {
    try {
        var remindTime = args[0];
        var remindTimescale = args[1];
        var remindContent = msg.content.split(args[1])[1];
        var d = new Date();
        var timeMS = time.toms(parseInt(remindTime), remindTimescale);
        var timeS = timeMS/1000, wait = timeMS + d.getTime();
        if(isNaN(remindTime) || isNaN(timeMS)){
            msg.reply(`The format is: \`${bot.prefix}reminder <number> <time scale> <reminder content>\` ie (${bot.prefix}reminder 20 minutes prepare for dnd). Please use a number for <number>`);
            return;
        }
        if(timeS < 10){
            msg.reply("Sorry, I can't set a reminder for under 10 seconds.")
        }
        else{
            msg.reply(`Alright, I'll remind you in ${remindTime} ${remindTimescale} to: \`${remindContent}\` via private message.`);
            fs.appendFile('reminderQueue.txt', `\n${msg.author.id}|#${wait}|#Unticked|#${remindContent}\n`, function (err) {});
        }
    }
    catch(Error){
        console.log(Error)
    }
}
module.exports.help = {
    name: "reminder",
    category: "Utility",
    description: "Sets a reminder for some unit of time to be sent to you in private messages.",
    detailedDesc: "<number> is some number.\n<timecode> is the unit of time in seconds, minutes, hours, days, weeks, or months.\n[message] is the specific message to be reminded of. When the alotted time passes, I should send you a private message detailing the reminder.",
    usage: "reminder <number> <timecode> [message]"
}