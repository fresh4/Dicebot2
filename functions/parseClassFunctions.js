var parse = require('../functions/parseFunctions.js');
var classFeatures = require('../functions/loadFunctions.js').loadClassFeatures();
var subclassFeatures = require('../functions/loadFunctions.js').loadSubclassFeatures();
exports.parseLevelTable = function(classs){
    let output = "",
    features = classFeatures.classfeatures;
    for(var i = 0; i < 20; i++){
        output += `\`${i+1}\`: `
        for(var j = 0; j < features.length; j++){
            if(features[j].className == classs.name){
                if(features[j].level == i+1) {
                    if(features[j+1] && features[j+1].level == i+1) output +=`${features[j].name}, `
                    else output += `${features[j].name}\n`
                }
            }
        }
        if(output.charAt(output.length-1) == " ") output += "\n"

    }
    return output
}
exports.parseSaveProfs = function(arrayOfProficiencies){
    let newArr = arrayOfProficiencies.slice(),
        message = "**Saving Throws**: ";
    for(var i = 0; i < arrayOfProficiencies.length; i++){
        let attribute = parseAttributes(arrayOfProficiencies[i]);
        if(i < arrayOfProficiencies.length - 1) message += `${attribute}, `
        else message += `${attribute}`
    }
    return message;
}
exports.parseStartProfs = function(startProfs){
    return `**Armor**: ${parseProf(startProfs, "armor")}\n` + 
           `**Weapons**: ${parseProf(startProfs, "weapons")}\n` +
           `**Tools**: ${parseProf(startProfs, "tools")}\n` + 
           `**Skills**: ${parseProf(startProfs, "skills")}`
}
function parseProf(startProfs, input){
    var output = "", 
        prof = (startProfs[input.toString()]) ? startProfs[input.toString()] : output = "None"; 
    if(output == "None") return output;
    for(var i = 0; i < prof.length; i++){
        if(prof[i].choose) output = `Choose ${prof[i].choose.count} from ${parseProf(prof[i].choose, "from")}`
        else if(i < prof.length - 1) output += `and ${prof[i]}, `
        else output += `${prof[i]}`
    }
    return output
}
exports.parseStartEquipment = function(startingEquipment){
    let output = "",
        equipmentArray = startingEquipment.default;
    for(var i = 0; i < equipmentArray.length; i++){
        output += `• ${equipmentArray[i]}\n`
    }
    output += (startingEquipment.goldAlternative) ? `Alternatively you can instead take ${startingEquipment.goldAlternative}gp and spend it on items from the equipment chapter in the PHB.` : "";
    return parse.removeTags(output);
}
exports.parseMulticlassingInfo = function(classs){
    let attributes = Object.keys(classs.multiclassing.requirements),
        stats = Object.values(classs.multiclassing.requirements),
        output = `To multiclass into ${classs.name} you must have `;
    for(var i = 0; i < attributes.length; i++){
        if(i < attributes.length - 1) output += `a ${parseAttributes(attributes[i])} score of ${stats[i]} or `
        else output += `a ${parseAttributes(attributes[i])} score of ${stats[i]}.\n`
    }
    if(classs.multiclassing.proficienciesGained){
        output += "You gain the following proficiencies when multiclassing into this class:\n";
        output += this.parseStartProfs(classs.multiclassing.proficienciesGained);
    }
    return output
}
exports.parseHitDice = function(classs){
    let hd = classs.hd,
        die = `${hd.number}d${hd.faces}`
    return `**Hit Dice**: ${die} per ${classs.name} level.\n` +
           `**Hit Points at 1st Level**: ${hd.faces} + your Constitution modifier.\n` +
           `**Hit Points at Higher Levels**: ${die} (or ${(hd.faces/2) + 1}) + your Constitution modifier per ${classs.name} level after 1st.`
}
exports.parseQuickStart = function(fluff){
    let output,
        found = false;
    function recurse(fluff){
        for(let i = 0; i < fluff.length; i++){
            if(fluff[i].entries){
                if(fluff[i].name == "Quick Build"){
                    found = true;
                    output = parse.removeTags(fluff[i].entries)
                } 
                else {
                    if(found) break;
                    recurse(fluff[i].entries)
                }
            }
        }
    }
    recurse(fluff)
    return output
}
exports.parseSubclassList = function(subclasses){
    let output = ""
    for(let i = 0; i < subclasses.length; i++){
        if(!subclasses[i].name.match("(UA)")){
            if(i < subclasses.length - 1) output += `${subclasses[i].name}, `
            else output += subclasses[i].name
        }
    }
    return output
}
exports.parseEntries = function(listOfEntries, embeddedMessage){
    listOfEntries.forEach(entry => {
        let output = parse.parseEntry(entry)
        output = parse.handleLongMessage(output, embeddedMessage, "Feature")
    })
}
exports.parseSubclassEntries = function(subclass, embeddedMessage){
    let output = ""
    subclassFeatures.subclassfeatures.forEach(feature => {
        if(feature){
            if(feature.subclassShortName == subclass.subclassShortName){
                //console.log(parse.parseEntry(feature.entries))
                output += `***${feature.name}.*** ${parse.parseEntry(feature.entries)}\n`
            }
        }
    })
    output = parse.handleLongMessage(output, embeddedMessage, "Subclass Features")
}
function parseAttributes(attribute){
    switch(attribute){
        case "con": return "Constitution"; 
        case "wis": return "Wisdom"; 
        case "cha": return "Charisma"; 
        case "dex": return "Dexterity"; 
        case "int": return "Intelligence"; 
        case "str": return "Strength"; 
    }
}