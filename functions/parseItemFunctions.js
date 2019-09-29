var parse = require('./parseFunctions.js');
exports.parseDefinitions = function(item){
    let output = [], topLine = "", botLines = ""
    if(item.wondrous) output.push("Wondrous Item")
    if(item.type && item.type != "OTH") output.push(`${convertItemType(item.type)}${(item.baseItem) ? ` (${item.baseItem})` : ""}`)
    if(item.tier) output.push(item.tier)
    if(item.rarity && item.rarity != "None") output.push(`${item.rarity}${(item.reqAttune) ? ` (Requires Attunement${(item.reqAttune != true) ? ` ${item.reqAttune}` : ""})` : ""}`)
    for(let i in output){
        if(i > 0) topLine += ", "
        topLine += output[i]
    }
    output = []
    if(item.value) output.push(`${item.value}`)
    if(item.weight) output.push(`${item.weight} lbs`)
    for(let i in output){
        if(i > 0) botLines += ", "
        botLines += output[i]
    }
    let final = `*${topLine}*\n${botLines}`
    return final
}

exports.parseDescription = function(item, message){
    let output = ""
    if(item.inherits) item = item.inherits
    output += (item.entries) ? parse.parseEntry(item.entries, "\n\n") + "\n" : "";
    output += (item.additionalEntries) ? parse.parseEntry(item.additionalEntries, "\n\n") : "";
    output += (item.items) ? listItems(item.items) : ""
    output = (output != "") ? parse.handleLongMessage(output, message, "Description") : "";
    return output
}

exports.parseSources = function(item){
    let output = ""
    if(item.inherits) item = item.inherits
    output += (item.source && item.page) ? `${parse.parseSources(item.source)} | page ${item.page}` : ""
    return output
}

function listItems(items){
    let output = ""
    items.forEach(item => {
        output += item + "\n"
    });
    return output
}

function convertItemType(type){
    let output
    switch (type) {
        case "AT": output = "Artisan's Tool"; break;
        case "G": output = "Adventuring Gear"; break;
        case "LA": output = "Light Armor"; break;
        case "MA": output = "Medium Armor"; break;
        case "HA": output = "Heavy Armor"; break;
        case "A": output = "Ammunition"; break;
        case "EXP": output = "Explosive"; break;
        case "GS": output = "Gaming Set"; break;
        case "INS": output = "Instrument"; break;
        case "MNT": output = "Mount"; break;
        case "M": output = "Melee Weapon"; break;
        case "P": output = "Potion"; break;
        case "RG": output = "Ring"; break;
        case "RD": output = "Rod"; break;
        case "R": output = "Ranged Weapon"; break;
        case "S": output = "Shield"; break;
        case "SHP": output = "Ship"; break;
        case "SCF": output = "Spellcasting Focus"; break;
        case "SC": output = "Scroll"; break;
        case "T": output = "Tool"; break;
        case "TG": output = "Trade Good"; break;
        case "TAH": output = "Tack and Harness"; break;
        case "LA": output = "Light Armor"; break;
        case "VEH": output = "Vehicle"; break;
        case "WD": output = "Wand"; break;
        default: output = type; break;
    }
    return output

}