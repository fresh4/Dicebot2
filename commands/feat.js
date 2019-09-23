var discord = require('discord.js');
var feats = require('../5eTools/data/feats.json');
var parser = require('../functions/parseFeatFunctions.js');
exports.run = (bot, msg, args = args.toString()) => {
    let feat = feats.feat
    feat.forEach(feat => {
        if(feat.name.toLowerCase().split(" ").toString() == args){
            if(feat.source == "UAFeatsForRaces") return;
            let prereqsMessage = "", description = "";
            if(feat.prerequisite){
                let prereqsArr = []
                feat.prerequisite.forEach(prereq => {
                    prereqsArr = prereqsArr.concat(parser.parsePrereqs(prereq));
                })
                description = `${parser.ReqArrToDesc(prereqsArr)}\n`;
            }
            if(feat.entries){
                description += parser.parseDescription(feat.entries, feat.ability);
            }
            if(feat.source){}
            msg.channel.send(new discord.RichEmbed()
                                                    .setTitle(feat.name)
                                                    .setDescription(description))
        }
    })
    //msg.channel.send("Feat not found.");
}