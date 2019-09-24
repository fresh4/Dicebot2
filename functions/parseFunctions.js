var books = require('../5eTools/data/books.json');

exports.parseSources = function(source){
    let bookName = source;
    books.book.forEach(book=>{
        if(source == book.id){
            bookName = book.name;
        }
    })
    return bookName;
}

exports.parseTable = function(tableObject){
    let description = "";
    for(let i in tableObject.colLabels){
        if(i == tableObject.colLabels.length - 1)
            description += `__${tableObject.colLabels[i]}__\n`;
        else description += `__${tableObject.colLabels[i]}__ | `;
    }
    for(let i in tableObject.rows){
        for(let j = 0; j < tableObject.colLabels.length; j++){
            if(j == tableObject.colLabels.length - 1)
                description += `${tableObject.rows[i][j]}\n`
            else description += `**${tableObject.rows[i][j]}** | `
        }
    }
    return description;
}

exports.removeFilters = function(input){
    let description = input, filteredMessage = "";
    if(description.match(/{@filter.*}/)){
        description = description.split(/(?=\{@filter.*})/);
        description.forEach(filter=>{
            if(filter.match(/{@filter.*?}/)){
                let filteredArray = jsplit(filter.split(/{@filter /)[1],/\|.*?}/g, 1);
                filteredArray.forEach(piece =>{
                    filteredMessage += piece;
                })
            } else filteredMessage += filter;
            
        })
    } else return input;
    return filteredMessage;
}
function jsplit(str, sep, n) {
    var out = [];

    while(n--) out.push(str.slice(sep.lastIndex, sep.exec(str).index));

    out.push(str.slice(sep.lastIndex));
    return out;
}