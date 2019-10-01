var parse = require('./parseFunctions.js')
exports.parseDescription = function(race){
    let output = ""
    output += parse.parseEntry(race.entries, "\n");
    return output
}

/*exports.parseSubraces = function(subrace, msg){
    let output = ""
    for(let i in subrace){
        output += `${subrace[i].name} subrace.\n`
        output += parse.parseEntry(subrace[i].entries, "\n");
    }
    output = parse.handleLongMessage(output, msg, "Subraces")
    return output
}*/

