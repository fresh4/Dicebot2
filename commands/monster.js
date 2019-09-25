var discord = require('discord.js');
var bestiary = require('../functions/loadFunctions.js').loadBestiary();
var parse = require('../functions/parseFunctions.js');
var monsterParser = require('../functions/parseMonsterFunctions.js');
exports.run = (bot, msg, args) => {
    try{
        let monsters = bestiary.monster;
        monsters.forEach(monster => {
            if(monster.name.toLowerCase().split(" ").toString() == args.toString()){
                let embeddedMessage = new discord.RichEmbed();
                let descriptors = monsterParser.parseDescriptor(monster);
                let physicals = monsterParser.parsePhysical(monster, embeddedMessage);
                let scores = monsterParser.parseScores(monster);
                let passiveInfo = monsterParser.parsePassives(monster);
                embeddedMessage.setTitle(monster.name)
                               .setDescription(descriptors)
                               .addField("Ability Scores", scores)
                               .addField("Attributes", passiveInfo);
                let traits = (monster.trait) ? monsterParser.parseTraits(monster, embeddedMessage) : null
                let actions = (monster.action) ? monsterParser.parseActions(monster.action, embeddedMessage, "ACTIONS") : null
                let legendaryActions = (monster.legendary) ? monsterParser.parseActions(monster.legendary, embeddedMessage, "LEGENDARY ACTIONS") : null
                let reactions = (monster.reaction) ? monsterParser.parseActions(monster.reaction, embeddedMessage, "REACTIONS") : null
                msg.channel.send(embeddedMessage.setColor("f44242"))
            }
        })
    }
    catch(Error){
        console.log(Error);
    }
}