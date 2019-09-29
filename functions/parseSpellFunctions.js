var parse = require('./parseFunctions.js');
exports.parseDefinitions = function(spell){
    let output = ""
    output += (spell.school) ? `*Level ${spell.level} - ${schoolAbrToFull(spell.school)}${(spell.meta && spell.meta.ritual) ? " (ritual)" : ""}*\n\n` : ""
    output += (spell.time) ? `**Casting Time:** ${parseCastingTime(spell.time[0])}\n` : ""
    output += (spell.range) ? `**Range:** ${parseRange(spell.range)}\n` : ""
    output += (spell.components) ? `**Components:** ${parseComponents(spell.components)}\n` : ""
    output += (spell.duration) ? `**Duration:** ${parseDuration(spell.duration[0])}\n` : ""
    return output
}
exports.parseDescription = function(spell, message){
    let output = ""
    output = parse.parseEntry(spell.entries, "\n") + "\n";
    output += (spell.entriesHigherLevel) ? parse.parseEntry(spell.entriesHigherLevel, "\n") : ""
    output = parse.handleLongMessage(output, message, "Description");
    return output
}
exports.parseClassList = function(spell){
    let output = ""
    if(spell.classes && spell.classes.fromClassList){
        for(let i in spell.classes.fromClassList){
            if(i > 0) output += ", "
            output += spell.classes.fromClassList[i].name    
        }
    }
    return output
}

function parseDuration(duration){
    if(duration.duration)
        return `${(duration.duration.amount) ? duration.duration.amount : ""} ` +
               `${(duration.duration.type) ? duration.duration.type : ""} ` + 
               `${(duration.concentration) ? "(concentration)" : ""}`
    else if(duration.type) return `${duration.type.charAt(0).toUpperCase() + duration.type.substring(1)}`
}
function parseComponents(components){
    return `${(components.v) ? "V " : ""}` +
           `${(components.s) ? "S " : ""}` + 
           `${(components.r) ? "R " : ""} ` + 
           `${(components.m) ? `M (${(components.m.text) ? components.m.text : components.m})` : ""} `
           
}
function parseRange(range){
    if(range.distance)
        return `${(range.distance.amount) ? range.distance.amount : ""} ` +
               `${(range.distance.type) ? range.distance.type : ""} `
    else if(range.type) return `${range.type.charAt(0).toUpperCase() + range.type.substring(1)}`
}
function schoolAbrToFull(school){
    return (school == "A") ? "Abjuration" :
           (school == "V") ? "Evocation" :
           (school == "E") ? "Enchantment" :
           (school == "C") ? "Conjuration" :
           (school == "I") ? "Illusion" :
           (school == "D") ? "Divination" :
           (school == "N") ? "Necromancy" :
           (school == "T") ? "Transmutation" :
           (school == "P") ? "Psionic?": ""
}
function parseCastingTime(time){
    return `${time.number} ` + 
           `${(time.unit == "bonus") ? "bonus action" : time.unit}` +
           `${(time.condition) ? ` ${time.condition}` : ""}`
}
