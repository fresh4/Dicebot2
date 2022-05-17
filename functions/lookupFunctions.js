var discord = require('discord.js');
var compare = require('string-similarity');
var classParser = require('../functions/parseClassFunctions.js')
var monsterParser = require('../functions/parseMonsterFunctions.js');
var spellParser = require('../functions/parseSpellFunctions.js');
var itemParser = require('../functions/parseItemFunctions.js');
var raceParser = require('../functions/parseRaceFunctions.js');
var backgroundParser = require('../functions/parseBackgroundFunctions.js');
var parse = require('../functions/parseFunctions.js');
var bestiary = require('../functions/loadFunctions.js').loadBestiary();
var subclasses = require('../functions/loadFunctions.js').loadSubClasses();


/*
FUCKING READ THIS YOU DIMWIT
COME BACK HERE AND REFORMAT THE EMBEDS
PASS IN EMBED ARRAYS INSTEAD SO YOU CAN RETURN THEM IN THE PARSE METHODS FOR WHEN THE MESSAGES ARE TOO LONG
DON'T FUCKING FORGET
*/

exports.lookup = function (book, msg, args) {
    let input = args.join(' ');
    let type = Object.keys(book)[0], entries = book[type], occurences = 0, listOfFoundObjects = [];
    if (input.includes("_copy")) {
        var result;
        entries.forEach(entry => {
            if (compare.compareTwoStrings(entry.name.toLowerCase(), input.split("_copy")[0].toLowerCase()) == 1) {
                result = entry;
            }
        })
        return result
    }
    entries.forEach(entry => {
        const relevance = compare.compareTwoStrings(entry.name.toLowerCase(), input.toLowerCase());
        if (relevance == 1) {
            occurences++;
            listOfFoundObjects.push(entry);
        }
        else if (relevance >= 0.5)
            listOfFoundObjects.push(entry);
    })
    if (occurences == 0) {
        if (listOfFoundObjects.length > 1)
            this.multipleMatches(listOfFoundObjects, msg, book)
        else if (listOfFoundObjects.length == 1) occurences = 1, input = listOfFoundObjects[0].name;
        else
            return msg.channel.send(`${type.charAt(0).toUpperCase() + type.substring(1)} not found.`)
    }
    if (occurences == 1) {
        entries.forEach(entry => {
            if (compare.compareTwoStrings(entry.name.toLowerCase(), input.toLowerCase()) == 1) {
                msg.channel.send(this.lookupByType(type, entry, args))
            }
        })
    }
    if (occurences > 1) {
        this.multipleMatches(listOfFoundObjects, msg, book)
    }
}
exports.multipleMatches = function (arrayOfMatches, msg, requestSource) {
    const type = Object.keys(requestSource)[0];
    const generateEmbed = (start) => {
        var desc = "";
        let iterator = 0;
        if (start + 10 <= arrayOfMatches.length) iterator = start + 10
        else iterator = start + (arrayOfMatches.length % 10)

        for (var k = start; k < iterator; k++) {
            if (type == "feature" && arrayOfMatches[k].className) {
                desc += `**[${k + 1}]** - ${arrayOfMatches[k].className} ${arrayOfMatches[k].level}: ${arrayOfMatches[k].name} *(Source: ${parse.parseSourcesName(arrayOfMatches[k])})*\n`
            }
            else desc += `**[${k + 1}]** - ${arrayOfMatches[k].name} *(Source: ${parse.parseSourcesName(arrayOfMatches[k])})*\n`
        }
        const embed = new discord.MessageEmbed()
            .setTitle(`Multiple matches found`)
            .setDescription(`${desc}\nPage ${parseInt(start / 10) + 1}/${parseInt(arrayOfMatches.length / 10) + 1}`)
            .setFooter("Type the number of your selection, or press 'c' to cancel selection.");
        const embeds = { embeds: [embed] }
        return embeds
    }
    msg.channel.send(generateEmbed(0)).then((msg2) => {
        const filter = m => m.author.id === msg.author.id;
        if (arrayOfMatches.length > 10) {
            msg2.react('⬅️')
            msg2.react('➡️')
        }
        const collector = msg2.createReactionCollector({
            filter: (reaction, user) =>
                ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === msg.author.id,
            time: 60000
        })
        let currentIndex = 0
        collector.on('collect', (reaction, user) => {
            // increase/decrease index
            reaction.emoji.name === '⬅️' ? currentIndex -= 10 : currentIndex += 10
            if (currentIndex < 0) currentIndex = (parseInt(arrayOfMatches.length / 10) * 10)
            if (currentIndex > arrayOfMatches.length) currentIndex = 0
            msg2.edit(generateEmbed(currentIndex))
            // react with left arrow if it isn't the start (await is used so that the right arrow always goes after the left)
            if (currentIndex !== 0) msg2.react('⬅️')
            // react with right arrow if it isn't the end
            if (currentIndex + 10 < arrayOfMatches.length) msg2.react('➡️')
        })
        msg.channel.awaitMessages({
            filter,
            max: 1,
            time: 60000
        })
            .then(collected => {
                var selectedItem = arrayOfMatches[parseInt(collected.first().content) - 1];
                if (selectedItem != 'c') {
                    requestSource[type].forEach(entry => {
                        if (compare.compareTwoStrings(entry.name, selectedItem.name) == 1 && entry.source == selectedItem.source && entry.className == selectedItem.className) {
                            if (entry.level) {
                                if (entry.level == selectedItem.level) {
                                    msg2.delete()
                                    msg2.channel.send(this.lookupByType(type, entry));
                                }
                            }
                            else {
                                msg2.delete()
                                msg2.channel.send(this.lookupByType(type, entry));
                            }
                        }
                    })
                }
            })
            .catch(err => {
                //console.log(err)
                msg2.delete();
                msg.channel.send("Selection canceled or timed out.");
            });
    });
}
exports.lookupByType = function (type, entry, args) {
    if (type == "feature") return this.classFeatLookup(entry)
    if (type == "feat") return this.FeatLookup(entry)
    if (type == "class") return this.classLookup(entry, args)
    if (type == "subclass") return this.subclassLookup(entry)
    if (type == "monster") return this.monsterLookup(entry)
    if (type == "spell") return this.spellLookup(entry)
    if (type == "item") return this.itemLookup(entry)
    if (type == "race") return this.raceLookup(entry)
    if (type == "background") return this.backgroundLookup(entry)
}
exports.classFeatLookup = function (classFeat) {
    let embeddedMessage = new discord.MessageEmbed(),
        embeddedMessages = { embeds: [embeddedMessage] };
    let description = classParser.parseEntries(classFeat.entries, embeddedMessage)
    embeddedMessage.setTitle(classFeat.name)
        //.setDescription(parse.parseEntry(classFeat.entries, "\n"))
        .setFooter(`Source: ${parse.parseSourcesName(classFeat.source)}`)
        .setColor("fa2af3");
    return embeddedMessages;
}
exports.subclassLookup = function (subclass) {
    let embeddedMessage = new discord.MessageEmbed(),
        embeddedMessages = { embeds: [embeddedMessage] };
    let description = classParser.parseSubclassEntries(subclass, embeddedMessage);
    embeddedMessage.setTitle(subclass.name)
        .setFooter(`Source: ${parse.parseSourcesName(subclass.source)}`)
        .setColor("fa2af3");
    return embeddedMessages;
}
exports.classLookup = function (classs, args) {
    let embeddedMessage = new discord.MessageEmbed(),
        embeddedMessages = { embeds: [embeddedMessage] };;
    let levelTable = classParser.parseLevelTable(classs);
    let hitDice = classParser.parseHitDice(classs);
    let saveProfs = classParser.parseSaveProfs(classs.proficiency);
    let startProfs = classParser.parseStartProfs(classs.startingProficiencies)
    let startEquipment = classParser.parseStartEquipment(classs.startingEquipment);
    let multiclassingInfo = classParser.parseMulticlassingInfo(classs);
    let quickStart = classParser.parseQuickStart(classs.fluff);
    //let subclassList = classParser.parseSubclassList(classs.subclasses);
    let source = `${parse.parseSourcesName(classs.source)} p. ${classs.page}`
    embeddedMessage.setTitle(classs.name)
        .setDescription(levelTable)
        .addField("Hit Points", hitDice)
        .addField("Starting Proficiencies", `${saveProfs}\n${startProfs}`)
        .addField("Starting Equipment", startEquipment)
        .addField("Multiclassing", multiclassingInfo)
        .addField("Quick Build", quickStart)
        //.setFooter(`${source}\nUse the classfeat command to lookup a specific feature.\nSubclasses: ${subclassList}`)
        .setColor("fa2af3")
    return embeddedMessages;
}
exports.monsterLookup = function (monster) {
    let originalMonster = monster,
        replace, replacewith;
    if (monster._copy) monster = this.lookup(bestiary, null, (monster._copy.name + "_copy").split(" "));

    let embeddedMessage = new discord.MessageEmbed().setColor("f44242"),
        embeddedMessages = { embeds: [embeddedMessage] };
    let footer = (monster.source) ? `Source: ${parse.parseSourcesName(monster.source)}, page ${(monster.page) ? monster.page : null}` : null
    let descriptors = monsterParser.parseDescriptor(monster);
    let physicals = monsterParser.parsePhysical(monster, embeddedMessage);
    let scores = monsterParser.parseScores(monster);
    let passiveInfo = monsterParser.parsePassives(monster);
    embeddedMessage.setTitle(originalMonster.name)
        .setDescription(descriptors)
        .addField("Ability Scores", scores)
        .addField("Attributes", passiveInfo)
        .setFooter(footer);
    let traits = (monster.trait || monster.spellcasting) ? monsterParser.parseTraits(monster) : null
    let actions = (monster.action) ? monsterParser.parseActions(monster.action) : null
    let legendaryActions = (monster.legendary) ? monsterParser.parseActions(monster.legendary) : null
    let reactions = (monster.reaction) ? monsterParser.parseActions(monster.reaction) : null

    if (originalMonster._copy) {
        if (originalMonster._copy._mod) {
            if (originalMonster._copy._mod["*"]) {
                replace = new RegExp(originalMonster._copy._mod["*"].replace, "ig")
                replacewith = originalMonster._copy._mod["*"].with;
                if (traits) traits = traits.replaceAll(replace, replacewith)
                if (actions) actions = actions.replaceAll(replace, replacewith)
                if (legendaryActions) legendaryActions = legendaryActions.replaceAll(replace, replacewith)
                if (reactions) reactions = reactions.replaceAll(replace, replacewith)
            }
        }
    }
    if (traits) traits = parse.handleLongMessage(traits, embeddedMessage, "TRAITS")
    if (actions) actions = parse.handleLongMessage(actions, embeddedMessage, "ACTIONS")
    if (legendaryActions) legendaryActions = parse.handleLongMessage(legendaryActions, embeddedMessage, "LEGENDARY ACTIONS")
    if (reactions) reactions = parse.handleLongMessage(reactions, embeddedMessage, "REACTIONS")

    return embeddedMessages;
}
exports.spellLookup = function (spell) {
    let embeddedMessage = new discord.MessageEmbed(),
        embeddedMessages = { embeds: [embeddedMessage] };
    let definitions = spellParser.parseDefinitions(spell);
    let description = spellParser.parseDescription(spell, embeddedMessage);
    let footer = `Classes: ${spellParser.parseClassList(spell)} | ${parse.parseSourcesName(spell.source)}, page ${(spell.page) ? spell.page : null}`
    embeddedMessage.setTitle(spell.name)
        .setDescription(definitions)
        .setFooter(footer)
        .setColor("3dff00");
    return embeddedMessages;
}
exports.itemLookup = function (item) {
    let embeddedMessage = new discord.MessageEmbed(),
        embeddedMessages = { embeds: [embeddedMessage] };
    let definitions = itemParser.parseDefinitions(item);
    if (item.ac) embeddedMessage.addField("AC", `${item.ac} ${(item.stealth) ? "(Disadvantage on Stealth checks)" : ""}`, true)
    if (item.dmg1) embeddedMessage.addField("Damage", `${item.dmg1}${(item.dmg2) ? `/${item.dmg2}` : ""}`, true)
    if (item.range) embeddedMessage.addField("Range", `${item.range} feet`, true)
    let description = itemParser.parseDescription(item, embeddedMessage);
    embeddedMessage.setTitle(item.name)
        .setDescription(definitions)
        .setFooter(itemParser.parseSources(item))
        .setColor("00b6fd")
    return embeddedMessages
}
exports.raceLookup = function (race) {
    let embeddedMessage = new discord.MessageEmbed(),
        embeddedMessages = { embeds: [embeddedMessage] };
    let description = raceParser.parseDescription(race)
    embeddedMessage.setTitle(race.name)
        .setDescription(description)
        .setColor("fa7d2a")
    //let subraces = (race.subraces) ? raceParser.parseSubraces(race.subraces, embeddedMessage) : null;

    return embeddedMessages;
}
exports.backgroundLookup = function (background) {
    let embeddedMessage = new discord.MessageEmbed(),
        embeddedMessages = { embeds: [embeddedMessage] };
    let description = backgroundParser.parseDescription(background, embeddedMessage);
    embeddedMessage.setTitle(background.name)
        .setFooter(itemParser.parseSources(background))
        .setColor("ffffff");;

    return embeddedMessages;
}