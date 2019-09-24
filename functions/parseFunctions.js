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
            if(filter.match(/{@filter.*}/)){
                let filteredArray = filter.split(/{@filter /)[1].split(/\|.*}/);
                filteredArray.forEach(piece =>{
                    filteredMessage += piece;
                })
            } else filteredMessage += filter;
        })
    } else return input;
    return filteredMessage;
}