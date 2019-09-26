var discord = require('discord.js');
var compare = require('string-similarity');
var monsterParser = require('../functions/parseMonsterFunctions.js');
var parse = require('../functions/parseFunctions.js');

exports.multipleMatches = function(arrayOfMatches, msg, requestSource){
    const menu = new discord.RichEmbed();
    menu.setTitle("Multiple matches found");
    var desc = "";
    for(var k = 0; k < arrayOfMatches.length; k++){
        desc += `**[${k+1}]** - ${arrayOfMatches[k].name} *(Source: ${parse.parseSources(arrayOfMatches[k].source)})*\n`
    }
    menu.setDescription(desc);
    menu.setFooter("Type the number of your selection, or press 'c' to cancel selection.");
    msg.channel.send(menu).then((msg2) => {
        const filter = m => m.author.id === msg.author.id;
        msg.channel.awaitMessages(filter, {
            max: 1,
            time: 30000
        })
        .then(collected => {
            var selectedItem = arrayOfMatches[parseInt(collected.first().content)-1];
            if(selectedItem != 'c'){
                requestSource.forEach(entry => { 
                    if(compare.compareTwoStrings(entry.name, selectedItem.name) == 1 && entry.source == selectedItem.source){
                        msg2.edit(this.monsterLookup(entry));
                    }
                })
            }
        })
        .catch(err => {
            console.log(err)
            msg2.delete();
            msg.channel.send("Selection canceled or timed out.");
        });
    });
}

exports.monsterLookup = function(monster){
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
    let footer = (monster.source) ? `Source: ${parse.parseSources(monster.source)}, page ${(monster.page) ? monster.page : null}` : null 
    embeddedMessage.setFooter(footer).setColor("f44242");
    return embeddedMessage
}