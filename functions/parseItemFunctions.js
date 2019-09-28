var parse = require('./parseFunctions.js');
exports.parseDefinitions = function(item){
    let output = ""
    output += (item.wondrous) ? "Wondrous Item " : ""

    output += (item.rarity) ? item.rarity : ""
    output += (item.reqAttune) ? " (Requires Attunement)" : ""
    return output
}

exports.parseDescription = function(item, message){
    let output = ""
    if(item.inherits) item = item.inherits
    output += (item.entries) ? parse.parseEntry(item.entries, "\n") + "\n" : "";
    output += (item.additionalEntries) ? parse.parseEntry(item.additionalEntries, "\n") : "";
    output += (item.items) ? listItems(item.items) : ""
    output = parse.removeTags(output);
    output = parse.handleLongMessage(output, message, "Description");
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