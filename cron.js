var fs = require('fs');
exports.cronify = function(bot){
    
    var CronJob = require('cron').CronJob;
    var job = new CronJob('* * * * * *', function() {
        var reminders = fs.readFileSync("reminderQueue.txt", {"encoding": "utf-8"}).split("\n");
        for(var i = 0; i < reminders.length - 1; i++){
            var d = new Date();
            var reminderIndex = reminders[i].split("|#");
            var reminderUser = reminderIndex[0], reminderTime = parseInt(reminderIndex[1]), reminderBool = reminderIndex[2], reminderContent = reminderIndex[3];
            if(reminderBool == "Unticked"){
                if(d.getTime() >= reminderTime - 1000){
                    bot.users.cache.get(reminderUser).send(`Here is your reminder: ${reminderContent}`);
                    reminders[i] = reminders[i].replace("Unticked", "Ticked");
                    var file = "";
                    for(var j = 0; j < reminders.length; j++){
                        file += reminders[j] + "\n";
                    }
                    fs.writeFile("reminderQueue.txt", file, "utf8", function(err){
                        if(err)
                            return;
                    });
                }
            }
        }
    }, null, true, 'America/Los_Angeles');
}