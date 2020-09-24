var discord = require('discord.js');
var feats = require('../5eTools/data/feats.json');
var funcParser = require('../functions/parseFeatFunctions.js');
var parser = require('../functions/parseFunctions.js');
exports.run = (bot, msg, args = args.toString()) => {
    feats.feat.forEach(feat => {
        if(feat.name.toLowerCase().split(" ").toString() == args){
            if(feat.source == "UAFeatsForRaces") return;
            let sourceBook = "", description = "";
            let embeddedMessage = new discord.MessageEmbed();
            if(feat.prerequisite){
                let prereqsArr = []
                feat.prerequisite.forEach(prereq => {
                    prereqsArr = prereqsArr.concat(funcParser.parsePrereqs(prereq));
                })
                description = `${funcParser.ReqArrToDesc(prereqsArr)}\n`;
            }
            if(feat.entries){
                description += funcParser.parseDescription(feat.entries, feat.ability, embeddedMessage);
            }
            if(feat.source){
                sourceBook = `Source: ${parser.parseSourcesName(feat.source)}, page ${feat.page}`;
            }
            msg.channel.send(embeddedMessage
                                            .setTitle(feat.name)
                                            .setDescription(description)
                                            .setFooter(sourceBook)
                                            .setColor("F1F21F"))
        }
    })
}
module.exports.help = {
    name: "feat",
    category: "Compendium Lookup",
    description: "Looks up the specified feat.",
    detailedDesc: "",
    usage: "feat <name>"
}