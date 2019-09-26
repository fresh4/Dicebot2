var discord = require('discord.js');
var bestiary = require('../functions/loadFunctions.js').loadBestiary();
var parse = require('../functions/parseFunctions.js');
var monsterParser = require('../functions/parseMonsterFunctions.js');
var compare = require('string-similarity');
var menu = require('../functions/lookupFunctions.js');
exports.run = (bot, msg, args) => {
    try{
        let monsters = bestiary.monster, input = msg.content.split("monster ")[1], occurences = 0, monsterList = [];
        monsters.forEach(monster => { 
            if(compare.compareTwoStrings(monster.name.toLowerCase(), input) == 1) {
                occurences++;     
                monsterList.push(monster);
            } 
            else if(compare.compareTwoStrings(monster.name.toLowerCase(), input) >= 0.5 && compare.compareTwoStrings(monster.name.toLowerCase(), input) !=1)
                monsterList.push(monster);
        })
        if(occurences == 0) {
            if(monsterList.length > 1)
                menu.multipleMatches(monsterList, msg, monsters)
            else 
                msg.channel.send("Monster not found.")
        }
        else if(occurences == 1){
            monsters.forEach(monster => { 
                if(compare.compareTwoStrings(monster.name.toLowerCase(), input) == 1) {
                    msg.channel.send(menu.monsterLookup(monster))
                }
            })
        }
        else {
            menu.multipleMatches(monsterList, msg, monsters)
        }
    }
    catch(Error){
        console.log(Error);
    }
}

