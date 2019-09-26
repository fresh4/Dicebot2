var parse = require('./parseFunctions.js');
exports.parseDescriptor = function(monster){
    let size = convertSize(monster.size);
    let alignment = convertAlignment(monster.alignment);
    let type = convertType(monster.type);
    return `*${size} ${type}, ${alignment}*`
}
exports.parsePhysical = function(monster, message){
    let AC = parseAC(monster.ac);
    let hp = parseHP(monster.hp);
    let speed = parseSpeed(monster.speed);
    message.addField("AC", AC, true).addField("HP", hp, true).addField("Speed", speed, true);
    return `**Armor Class:** ${AC}\n**HP:** ${hp}\n**Speed:** ${speed}`
}
exports.parseScores = function(monster){
    return `**STR:** ${monster.str} (${toModifier(monster.str)}) ` + 
           `**DEX:** ${monster.dex} (${toModifier(monster.dex)}) ` + 
           `**CON:** ${monster.con} (${toModifier(monster.con)}) ` +
           `**INT:** ${monster.int} (${toModifier(monster.int)}) ` + 
           `**WIS:** ${monster.wis} (${toModifier(monster.wis)}) ` +
           `**CHA:** ${monster.cha} (${toModifier(monster.cha)}) `
}
exports.parsePassives = function(monster){
    let output = "";
    if(monster.save) output += `**Saving Throws** ${parseSaves(monster.save)}\n`
    if(monster.skill) output += `**Skills** ${parseSkills(monster.skill)}\n`
    if(monster.immune) output += `**Damage Immunities** ${parseResistances(monster.immune, "immune")}\n`
    if(monster.resist) output += `**Damage Resistances** ${parseResistances(monster.resist, "resist")}\n`
    if(monster.vulnerable) output += `**Damage Vulnerabilities** ${parseResistances(monster.vulnerable, "vulnerable")}\n`
    if(monster.conditionImmune) output += `**Condition Immunities** ${parseResistances(monster.conditionImmune, "conditionImmune")}\n`
    if(monster.senses || monster.passive) output += `**Senses** ${parseSenses(monster)}\n`
    if(monster.languages) output += `**Languages** ${parseSimpleEntry(monster.languages, ", ")}\n`
    if(monster.cr) output += `**Challenge** ${parseCR(monster.cr)}\n`
    return output;
}
exports.parseTraits = function(monster, message){
    let output = ""
    monster.trait.forEach(trait => {
        output += (trait.name) ? `***${trait.name}*** ` : ""
        if(trait.entries)
            trait.entries.forEach(entry => {
                output += `${entry}\n`
            })
    })
    if(monster.spellcasting){ 
        monster.spellcasting.forEach(castingInfo => {
            output += (castingInfo.name) ? `***${castingInfo.name}*** ` : ""
            output += (castingInfo.headerEntries) ? `${parseSimpleEntry(castingInfo.headerEntries, "\n")}\n` : ""
            output += (castingInfo.will) ? `At will: *${parseSimpleEntry(castingInfo.will, ", ")}*\n` : ""
            if(castingInfo.daily){
                output += (castingInfo.daily["1e"]) ? `1/day each: *${parseSimpleEntry(castingInfo.daily["1e"], ", ")}*\n` : ""
                output += (castingInfo.daily["2e"]) ? `2/day each: *${parseSimpleEntry(castingInfo.daily["2e"], ", ")}*\n` : ""
                output += (castingInfo.daily["3e"]) ? `3/day each: *${parseSimpleEntry(castingInfo.daily["3e"], ", ")}*\n` : ""
            }
            if(castingInfo.spells){
                output += (castingInfo.spells["0"]) ? `Cantrips (at will): *${parseSimpleEntry(castingInfo.spells["0"].spells, ", ")}*\n` : ""
                for(let level = 1; level <= 9; level++){
                    num = (level == "1") ? "st" : (level == "2") ? "nd" : (level == "3") ? "rd": "th"
                    output += (castingInfo.spells[level]) ? `${level}${num} Level (${castingInfo.spells[level].slots} slots): *${parseSimpleEntry(castingInfo.spells[level].spells, ", ")}*\n` : ""
                }
                output += (castingInfo.footerEntries) ? `${parseSimpleEntry(castingInfo.footerEntries, ", ")}\n` : "";
            }
        })
    }
    output = parse.removeTags(output);
    output = parse.handleLongMessage(output, message, "TRAITS");
    return output;
}
exports.parseActions = function(monster, message, title){
    let output = ""
    output = parseNameEntry(monster)
    output = parse.removeTags(output);
    output = parse.handleLongMessage(output, message, title);
    return output;
}
function parseResistances(immunity, type){
    let output = "";
    for(let i in immunity){
        if(i > 0 && !immunity[i][type]) output += ", ";
        
        if(immunity[i][type]){
            output += (i == 0) ? "" : "; "
            output += (immunity[i].preNote) ? `${immunity[i].preNote} ` : ""
            output += `${parseResistances(immunity[i][type])}`;
        }
        else if(immunity[i].special){
            output += (i == 0) ? "" : "; "
            output += `${immunity[i].special}`;
        }
        else output += immunity[i];
        if(immunity[i].note) output += ` ${immunity[i].note}`
    }
    return output;
}
function parseNameEntry(monster){
    let output = ""
    monster.forEach(entry =>{
        output += (entry.name) ? `***${entry.name}.*** ` : ""
        output += (entry.entries) ? `${parseSimpleEntry(entry.entries, "\n")}\n` : ""
    })
    return output
}
function parseSimpleEntry(entry, delim){
    let output = ""
    for(let i in entry){
        output += (i > 0) ? `${delim}` : ""
        if(entry[i].items) output += parseList(entry[i].items)
        else output += `${entry[i].replace("*", "\\*")}`
    }
    return output;
}
function parseList(list){
    let output = ""
    for(let i in list){
        output += (list[i].name) ? `**${list[i].name}** ` : ""
        output += (list[i].entry) ? (i < list.length-1) ? `${list[i].entry}\n` : `${list[i].entry}` : ""
    }
    return output
}
function parseSenses(monster){
    let output = "";
    for(let i in monster.senses){
        output += (i > 0) ? ", " : ""
        output += monster.senses[i]
    }
    output += (output != "") ? ", " : ""
    output += (monster.passive) ? `Passive Perception ${monster.passive}` : "" 
    return output;
}
function parseCR(cr){
    let output = "";
    output += (cr.cr) ? `${cr.cr} (${CRtoXP(cr.cr)} XP)` : `${cr} (${CRtoXP(cr)}xp)`
    output += (cr.lair) ? ` or ${cr.lair} (${CRtoXP(cr.lair)} XP) when in its lair` : ""
    output += (cr.coven) ? ` or ${cr.coven} (${CRtoXP(cr.coven)} XP) when in a coven` : ""
    return output;
}
function CRtoXP(input){
    let cr = ""
    switch(input){
        case("0"): cr = "0"; break;
        case("1/8"): cr = "25"; break;
        case("1/4"): cr = "50"; break;
        case("1/2"): cr = "100"; break;
        case("1"): cr = "200"; break;
        case("2"): cr = "450"; break;
        case("3"): cr = "700"; break;
        case("4"): cr = "1,100"; break;
        case("5"): cr = "1,800"; break;
        case("6"): cr = "2,300"; break;
        case("7"): cr = "2,900"; break;
        case("8"): cr = "3,900"; break;
        case("9"): cr = "5,000"; break;
        case("10"): cr = "5,900"; break;
        case("11"): cr = "7,200"; break;
        case("12"): cr = "8,400"; break;
        case("13"): cr = "10,000"; break;
        case("14"): cr = "11,500"; break;
        case("15"): cr = "13,000"; break;
        case("16"): cr = "15,000"; break;
        case("17"): cr = "18,000"; break;
        case("18"): cr = "20,000"; break;
        case("19"): cr = "22,000"; break;
        case("20"): cr = "25,000"; break;
        case("21"): cr = "33,000"; break;
        case("22"): cr = "41,000"; break;
        case("23"): cr = "50,000"; break;
        case("24"): cr = "62,000"; break;
        case("25"): cr = "75,000"; break;
        case("26"): cr = "90,000"; break;
        case("27"): cr = "105,000"; break;
        case("28"): cr = "120,000"; break;
        case("29"): cr = "135,000"; break;
        case("30"): cr = "155,000"; break;
    }
    return cr;
}
function parseSaves(save){
    let output = "";
    output += (save.str) ? `Str ${save.str} ` : "";
    output += (save.dex) ? `Dex ${save.dex} ` : "";
    output += (save.con) ? `Con ${save.con} ` : "";
    output += (save.wis) ? `Wis${save.wis} ` : "";
    output += (save.int) ? `Int ${save.int} ` : "";
    output += (save.cha) ? `Cha ${save.cha} ` : "";
    return output;
}
function parseSkills(skill){
    let output = "";
    output += (skill.acrobatics) ? `Acrobatics ${skill.acrobatics} ` : "";
    output += (skill["animal handling"]) ? `Animal Handling ${skill["animal handling"]} ` : "";
    output += (skill.arcana) ? `Arcana ${skill.arcana} ` : "";
    output += (skill.athletics) ? `Athletics ${skill.athletics} ` : "";
    output += (skill.deception) ? `Deception ${skill.deception} ` : "";
    output += (skill.history) ? `History ${skill.history} ` : "";
    output += (skill.insight) ? `Insigh ${skill.insight} ` : "";
    output += (skill.intimidation) ? `Intimidation ${skill.intimidation} ` : "";
    output += (skill.investigation) ? `Investigation ${skill.investigation} ` : "";
    output += (skill.medicine) ? `Medicine ${skill.medicine} ` : "";
    output += (skill.nature) ? `Nature ${skill.nature} ` : "";
    output += (skill.perception) ? `Perception ${skill.perception} ` : "";
    output += (skill.performance) ? `Performance ${skill.performance} ` : "";
    output += (skill.persuasion) ? `Persuasion ${skill.persuasion} ` : "";
    output += (skill.religion) ? `Religion ${skill.religion} ` : "";
    output += (skill["sleight of hand"]) ? `Sleight of Hand ${skill["sleight of hand"]} ` : "";
    output += (skill.stealth) ? `Stealth ${skill.stealth} ` : "";
    output += (skill.survival) ? `Survival ${skill.survival} ` : "";
    return output;
}
function toModifier(input){
    let val = Math.floor((input-10)/2);
    return (val < 0) ? val : `+${val}`
}
function parseSpeed(input){
    let output = "";
    if(input.walk) output += `${input.walk} ft.`; else output += "0 ft." 
    if(input.burrow) output += `, burrow ${input.burrow} ft.`
    if(input.climb) output += `, climb ${input.climb} ft.`
    if(input.swim) output += `, swim ${input.swim} ft.`
    if(input.fly) {
        output += (input.canHover) ? `, fly ${input.fly.number} ft. ${input.fly.condition} ` : `, fly ${input.fly} ft. `
    }
    return output;
}
function parseAC(input){
    let output = "";
    for(let i in input){
        if(i > 0) output += `, `
        if(input[i].ac) output += input[i].ac
        if(input[i].from) output += ` (${input[i].from})`
        if(input[i].condition) output += ` ${input[i].condition}`
        if(!input[i].ac) output = input[i]
    }
    output = parse.removeTags(output);
    return output;
}
function parseHP(input){
    return `${input.average} (${input.formula})`
}
function convertSize(input){
    let size = "";
    switch(input){
        case "T": size = "Tiny"; break;
        case "S": size = "Small"; break;
        case "M": size = "Medium"; break;
        case "L": size = "Large"; break;
        case "H": size = "Huge"; break;
        case "G": size = "Gargantuan"; break;
    }
    return size;
}
function convertAlignment(input){ //FIX
    //"L","N","NX","NY","C","G","E","U","A"
    let output = []
    for(i in input){
        switch(input[i]){
            case "L": output[i] = "Lawful"; break;
            case "N": output[i] = "Neutral"; break;
            case "C": output[i] = "Chaotic"; break;
            case "G": output[i] = "Good"; break;
            case "E": output[i] = "Evil"; break;
            case "A": output[i] = "Any Alignment"; break;
            case "U": output[i] = "Unaligned"; break;
            //case "NX": output[i] += `Neutral ${output[i]}`; break;
            //case "NY": output[i] += `${output[i]} Neutral`; break;

        }

    }
    return output;

}
function convertType(input){
    if(input.tags) return `${input.type} (${input.tags[0]})`
    else return input
}