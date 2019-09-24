var books = require('../5eTools/data/books.json');

class tags {
    constructor(input) {
        this.input = input;
    }
    removeFilters(){
        this.input = filterFunc("filter", this.input, false)
        return this;
    }
    removeBooks(){
        this.input = filterFunc("book", this.input, false)
        return this;
    }
    removeSpells(){
        this.input = filterFunc("spell", this.input, true)
        return this;
    }
    removeConditions(){
        this.input = filterFunc("condition", this.input, true)
        return this;
    }
    removeItems(){
        this.input = filterFunc("item", this.input, false)
        return this;
    }
    removeDice(){
        this.input = filterFunc("dice", this.input, true)
        return this;
    }
    removeClass(){
        this.input = filterFunc("class", this.input, false)
        return this;
    }
    toString(){
        return this.input;
    }
}

exports.removeTags = function(input){
    return new tags(input).removeFilters().removeBooks().removeSpells().removeConditions().removeItems().removeDice().removeClass().toString();
}
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
function filterFunc(regex, input, isSimple){
    let description = input, filteredMessage = "";
    var fullRegex = new RegExp("{@" + regex + ".*}"),
        lookaheadRegex = new RegExp("(?=\\{@" + regex + ".*})"),
        firstRegex = new RegExp("{@" + regex + ".*?}"),
        partialRegex = new RegExp("{@" + regex + " ");
    if(description.match(fullRegex)){
        description = description.split(lookaheadRegex);
        description.forEach(filter=>{
            if(filter.match(firstRegex)){
                let filteredArray
                if(!isSimple) filteredArray = jsplit(filter.split(partialRegex)[1], /\|.*?}/g, 1);
                else filteredArray = jsplit(filter.split(partialRegex)[1], /}/g, 1);
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