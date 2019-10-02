var loot = require('../5eTools/data/loot.json');
var table = require('../functions/tableFunctions.js');
var roll = require('../functions/diceFunctions.js');
var parse = require('../functions/parseFunctions.js');
var discord = require('discord.js');
exports.run = (bot, msg, args) => {
    if(args.length != 1) {return msg.channel.send(`Invalid arguments. Usage is \`${this.help.usage}\``)}
    let CR = parseInt(args[0]), hoardTables = loot.hoard, d100 = roll.RollSingle(100);
    if(CR < 0 || CR > 30) return msg.channel.send("CR must be between 0 and 30")
    let items = pickTable(CR, hoardTables) //hoard.table
    let coins = parseCoins(items.coins)
    items = items.table;
    let gems = pickLoot(items, "gems", d100),
        art = pickLoot(items, "artobjects", d100),
        magicItems = parse.removeTags(pickLoot(items, "magicitems", d100));
    let embed = new discord.RichEmbed().setTitle("Loot Generator")
                                       .setDescription(`Items generated for a hoard belonging to a CR ${CR} creature`)
                                       .addField("**Coins**", coins)
                                       .addField("**Gems**", gems)
                                       .addField("**Art**", art)
                                       .addField("**Magic Items**", magicItems)
                                       .setColor("808080")
    msg.channel.send(embed)
}
function pickLoot(table, lootType, dice){
    let output = ""
    table.forEach(entry => {
        if(entry.min <= dice && dice <= entry.max){
            if(entry[lootType]){
                if(lootType == "gems"){
                    output = rollLoot(loot.gemstones, entry[lootType].type, entry[lootType].amount)
                }
                if(lootType == "artobjects"){
                    output = rollLoot(loot.artobjects, entry[lootType].type, entry[lootType].amount)
                }
                if(lootType == "magicitems"){
                    output = rollLoot(loot.magicitems, entry[lootType].type, entry[lootType].amount)
                }
            } else output = "None."
        }
    })
    return output
}
function rollLoot(item, type, amount){
    let output = ""
    item.forEach(entry => {
        if(entry.type == type){
            let dice = amount.split("d");
            let rollAmount = roll.RollX(dice[0], dice[1]);
            output = `*${rollAmount}* x ${entry.name}`
            if(type.match(/[A-I]/)){
                output += "\n"
                for(let i = 0; i < rollAmount; i++){
                    if(i > 0) output += "\n";
                    output += table.rollTable(entry.table, 100)
                }
            }
            
        }
       
    })
    return output;
}
function parseCoins(coins){
    let output = ""
    Object.keys(coins).forEach(coin => {
        let multiplier = coins[coin].split(/d|\*/)
        let rolledCoins = roll.RollX(multiplier[0], multiplier[1]) * parseInt(multiplier[2]);
        output += `**${coin}** ${rolledCoins}\n`;
    })
    return output
}
function pickTable(CR, tables){
    let output = ""
    tables.forEach(option => {
        if(option.mincr <= CR && CR <= option.maxcr) output = option
    });
    return output
}
module.exports.help = {
    name: "hoard",
    category: "Generator",
    description: "Generates loot based on hoard CR.",
    detailedDesc: "<CR> argument takes a number between 0 and 30, as per the hoard generator in the DMG.",
    usage: "hoard <CR>"
}