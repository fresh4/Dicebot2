var parse = require('./parseFunctions.js');
exports.parseDescription = function(backgrounds, message){
    let output = parse.parseEntry(backgrounds.entries, "\n");
    output = parse.handleLongMessage(output, message, "Description");
    return output;
}