var Enmap = require('enmap');
var fs = require('fs');
exports.run = (bot, msg, args) => {
    var helpInfo = new Enmap();
    bot.commands.keyArray().forEach(command =>{
        helpInfo.set(command, `test for ${command}`);
    });
    fs.readdir("./help_docs/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".js")) return;
            //let props = require(`./help_docs/${file}`);
            //let commandName = file.split(".")[0];
            //console.log(`Attempting to load help doc ${commandName}`);

        });
    });
    
}