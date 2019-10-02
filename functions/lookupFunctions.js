var discord = require('discord.js');
var compare = require('string-similarity');
var monsterParser = require('../functions/parseMonsterFunctions.js');
var spellParser = require('../functions/parseSpellFunctions.js');
var itemParser = require('../functions/parseItemFunctions.js');
var raceParser = require('../functions/parseRaceFunctions.js');
var parse = require('../functions/parseFunctions.js');

exports.lookup = function(book, msg, input){
    let type = Object.keys(book)[0], entries = book[type], occurences = 0, listOfFoundObjects = [];
    entries.forEach(entry => { 
        if(compare.compareTwoStrings(entry.name.toLowerCase(), input.toLowerCase()) == 1) {
            occurences++;     
            listOfFoundObjects.push(entry);
        } 
        else if(compare.compareTwoStrings(entry.name.toLowerCase(), input) >= 0.5 && compare.compareTwoStrings(entry.name.toLowerCase(), input) !=1)
            listOfFoundObjects.push(entry);
    })
    if(occurences == 0) {
        if(listOfFoundObjects.length > 1)
            this.multipleMatches(listOfFoundObjects, msg, book)
        else if(listOfFoundObjects.length == 1) occurences = 1, input = listOfFoundObjects[0].name;
        else 
            return msg.channel.send(`${type.charAt(0).toUpperCase() + type.substring(1)} not found.`)
    }
    if(occurences == 1){
        entries.forEach(entry => { 
            if(compare.compareTwoStrings(entry.name.toLowerCase(), input.toLowerCase()) == 1) {
                msg.channel.send(this.lookupByType(type, entry))
            }
        })
    }
    if(occurences > 1) {
        this.multipleMatches(listOfFoundObjects, msg, book)
    }
}
exports.multipleMatches = function(arrayOfMatches, msg, requestSource){
    const type = Object.keys(requestSource)[0];
    const menu = new discord.RichEmbed().setColor("6a90ff");
    menu.setTitle("Multiple matches found");
    var desc = "";
    for(var k = 0; k < arrayOfMatches.length; k++){
        desc += `**[${k+1}]** - ${arrayOfMatches[k].name} *(Source: ${parse.parseSources(arrayOfMatches[k])})*\n`
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
                requestSource[type].forEach(entry => { 
                    if(compare.compareTwoStrings(entry.name, selectedItem.name) == 1 && entry.source == selectedItem.source){
                        msg2.edit(this.lookupByType(type, entry));
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
exports.lookupByType = function(type, entry){
    if(type == "monster") return this.monsterLookup(entry)
    if(type == "spell") return this.spellLookup(entry)
    if(type == "item") return this.itemLookup(entry)
    if(type == "race") return this.raceLookup(entry)
}
exports.monsterLookup = function(monster){
    let embeddedMessage = new discord.RichEmbed().setColor("f44242");
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
    embeddedMessage.setFooter(footer);
    return embeddedMessage
}
exports.spellLookup = function(spell){
    let embeddedMessage = new discord.RichEmbed();
    let definitions = spellParser.parseDefinitions(spell);
    embeddedMessage.setTitle(spell.name)
                   .setDescription(definitions)
    let description = spellParser.parseDescription(spell, embeddedMessage);
    let footer = `Classes: ${spellParser.parseClassList(spell)} | ${parse.parseSources(spell.source)}, page ${(spell.page) ? spell.page : null}`
    embeddedMessage.setFooter(footer).setColor("3dff00");
    return embeddedMessage
}
exports.itemLookup = function(item){
    let embeddedMessage = new discord.RichEmbed();
    let definitions = itemParser.parseDefinitions(item);
    embeddedMessage.setTitle(item.name)
                   .setDescription(definitions)
    let description = itemParser.parseDescription(item, embeddedMessage);
    let footer = itemParser.parseSources(item)
    embeddedMessage.setFooter(footer).setColor("00b6fd")
    return embeddedMessage
}
exports.raceLookup = function(race){
    let embeddedMessage = new discord.RichEmbed();
    let description = raceParser.parseDescription(race)
    embeddedMessage.setTitle(race.name)
                   .setDescription(description)
    //let subraces = (race.subraces) ? raceParser.parseSubraces(race.subraces, embeddedMessage) : null;

    return embeddedMessage;
}