var parse = require('./parseFunctions.js');
exports.parseDescription = function(entries, ability, embeddedMessage){
    let fullDescription = "";
    entries.forEach(entry=>{
        if(entry.type){
            if(entry.type == "list"){
                if(ability){
                    fullDescription += `• ${parseASI(ability[0])}\n\n`;
                }
                entry.items.forEach(item=>{
                    fullDescription += `• ${item}\n\n`
                })
                
            }
            else if(entry.type == "table"){
                embeddedMessage.addField(entry.caption, parse.parseTable(entry));
            }
            else if(entry.type == "entries"){
                fullDescription += `**${entry.name}**\n`;
                entry.entries.forEach(subEntry =>{
                    fullDescription += `${subEntry}\n`;
                })
            }
        } else fullDescription += `${entry}\n\n`;
    })
    return fullDescription;
}

function parseASI(ability){
    let ASI = "";
    if(ability.choose){
        let choicesArr = [], choices = "", count = 0;
        ability.choose.from.forEach(from=>{
            switch(from){
                case "int": choicesArr[count] = "Intelligence"; break
                case "wis": choicesArr[count] = "Wisdom"; break
                case "str": choicesArr[count] = "Strength"; break
                case "cha": choicesArr[count] = "Charisma"; break
                case "dex": choicesArr[count] = "Dexterity"; break
                case "con": choicesArr[count] = "Constitution"; break
            }
            count++;
        })
        for(let i in choicesArr){
            if(i == 0) choices += choicesArr[i];
            else choices += ` or ${choicesArr[i]}`;
        }
        ASI += `Increase your ${choices} score by ${ability.choose.amount}, to a maximum of 20.`;
    } else{
        if(ability.con) ASI += `Increase your Constitution score by ${ability.con}, to a maximum of 20.`;
        if(ability.dex) ASI += `Increase your Dexterity score by ${ability.dex}, to a maximum of 20.`;
        if(ability.str) ASI += `Increase your Strength score by ${ability.str}, to a maximum of 20.`;
        if(ability.wis) ASI += `Increase your Wisdom score by ${ability.wis}, to a maximum of 20.`;
        if(ability.int) ASI += `Increase your Intelligence score by ${ability.int}, to a maximum of 20.`;
        if(ability.cha) ASI += `Increase your Charisma score by ${ability.cha}, to a maximum of 20.`;
    }
    return ASI;
}
exports.parsePrereqs = function(prereq){
    let prereqArr = []
    if(prereq.ability) prereqArr = prereqArr.concat(parseAbility(prereq.ability));
    if(prereq.race) prereqArr = prereqArr.concat(parseRace(prereq.race));
    if(prereq.proficiency) prereqArr = prereqArr.concat(parseProficiency(prereq.proficiency));
    if(prereq.spellcasting) prereqArr.push("The ability to cast a spell.");
    if(prereq.level) prereqArr.push(`Level ${prereq.level} or higher`);
    if(prereq.special) prereqArr.push(prereq.special);
    return prereqArr;
}
exports.ReqArrToDesc = function(arr){
    return `*Prerequisites: ${arr}*`
}
function parseAbility(prereq){
    let prereqsArr = [];
    for(let i in prereq){
        if(prereq[i].int) prereqsArr.push(`Intelligence ${prereq[i].int} or higher`)
        if(prereq[i].wis) prereqsArr.push(`Wisdom ${prereq[i].wis} or higher`)
        if(prereq[i].cha) prereqsArr.push(`Charisma ${prereq[i].cha} or higher`)
        if(prereq[i].str) prereqsArr.push(`Strength ${prereq[i].str} or higher`)
        if(prereq[i].dex) prereqsArr.push(`Dexterity ${prereq[i].dex} or higher`)
        if(prereq[i].con) prereqsArr.push(`Constitution ${prereq[i].con} or higher`)
    }    
    return prereqsArr;
}

function parseRace(prereq){
    let prereqsArr = [];
    for(let i in prereq){
        if(prereq[i].subrace) prereqsArr.push(`Race: ${prereq[i].name} (${prereq[i].subrace})`)
        else prereqsArr.push(`Race: ${prereq[i].name}`)
    }    
    return prereqsArr;
}

function parseProficiency(prereq){
    let prereqsArr = [];
    for(let i in prereq){
        if(prereq[i].armor) prereqsArr.push(`Proficiency in ${prereq[i].armor} armor`)
    }
    return prereqsArr;
}