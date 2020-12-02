var books = require('../5eTools/data/books.json');
var discord = require('discord.js');
class tags {
    constructor(input) {
        this.input = replaceStupidFilters(input.toString());
    }
    removeFilters(){
        this.input = filterFunc("filter", this.input)
        return this;
    }
    removeBooks(){
        this.input = filterFunc("book", this.input)
        return this;
    }
    removeSpells(){
        this.input = filterFunc("spell", this.input)
        return this;
    }
    removeConditions(){
        this.input = filterFunc("condition", this.input)
        return this;
    }
    removeItems(){
        this.input = filterFunc("item", this.input)
        return this;
    }
    removeDice(){
        this.input = filterFunc("dice", this.input)
        return this;
    }
    removeClass(){
        this.input = filterFunc("class", this.input)
        return this;
    }
    removeDamage(){
        this.input = filterFunc("damage", this.input)
        return this
    }
    removeDC(){
        this.input = filterFunc("dc", this.input)
        return this
    }
    removeSkill(){
        this.input = filterFunc("skill", this.input)
        return this
    }
    removeToHit(){
        this.input = filterFunc("hit", this.input)
        return this
    }
    removeOnHit(){
        this.input = filterFunc("h", this.input)
        return this
    }
    removeAttack(){
        this.input = filterFunc("atk", this.input)
        return this
    }
    removeRecharge(){
        this.input = filterFunc("recharge", this.input)
        return this
    }
    removeCreatures(){
        this.input = filterFunc("creature", this.input)
        return this
    }
    removeNotes(){
        this.input = filterFunc("note", this.input)
        return this
    }
    removeChance(){
        this.input = filterFunc("chance", this.input)
        return this
    }
    removeSense(){
        this.input = filterFunc("sense", this.input)
        return this
    }
    removeTable(){
        this.input = filterFunc("table", this.input)
        return this
    }
    removeBackground(){
        this.input = filterFunc("background", this.input)
        return this
    }
    removeAction(){
        this.input = filterFunc("action", this.input)
        return this
    }
    removeRace(){
        this.input = filterFunc("race", this.input);
        return this
    }
    removeScaleDamage(){
        this.input = filterFunc("scaledamage", this.input);
        return this
    }
    toString(){
        return this.input
    }
}

exports.removeTags = function(input){
    return new tags(input).removeFilters()
                          .removeNotes()
                          .removeBooks()
                          .removeSpells()
                          .removeConditions()
                          .removeItems()
                          .removeDice()
                          .removeClass()
                          .removeDamage()
                          .removeDC()
                          .removeToHit()
                          .removeOnHit()
                          .removeSkill()
                          .removeAttack()
                          .removeRecharge()
                          .removeCreatures()
                          .removeChance()
                          .removeSense()
                          .removeTable()
                          .removeBackground()
                          .removeAction()
                          .removeRace()
                          .removeScaleDamage()
                          .toString()
}
exports.parseSourcesName = function(source){
    if(source.inherits) source = source.inherits
    if(source.source) source = source.source 
    let bookName = source
    books.book.forEach(book=>{
        if(source == book.id){
            bookName = book.name
        }
    })
    return bookName
}
exports.parseTable = function(tableObject){
    let tableRows = "", tableHeader = "\n"
    for(let i in tableObject.colLabels){
        if(i == tableObject.colLabels.length - 1) tableHeader += `__${tableObject.colLabels[i]}__\n`
        else tableHeader += `__${tableObject.colLabels[i]}__ **\|** `
    }
    for(let i in tableObject.rows){
        for(let j = 0; j < tableObject.colLabels.length; j++){
            if(tableObject.rows[i][j].roll){
                if(tableObject.rows[i][j].roll.min && tableObject.rows[i][j].roll.max != undefined){
                    if(tableObject.rows[i][j].roll.max == 0) tableObject.rows[i][j].roll.max = 100
                    tableRows += `**${tableObject.rows[i][j].roll.min} - ${tableObject.rows[i][j].roll.max}** **\|** `

                }
                else if(tableObject.rows[i][j].roll.exact) tableRows += `**${tableObject.rows[i][j].roll.exact}** \| `
            }
            else{
                if(j == 0) tableRows += `**${this.removeTags(tableObject.rows[i][j])}** **\|** `
                else if(j == tableObject.colLabels.length - 1) tableRows += `${this.removeTags(tableObject.rows[i][j])}`
                else tableRows += `${this.removeTags(tableObject.rows[i][j])} **\|** `
            }
            
        }
        tableRows += "\n"
    }
    return tableHeader + tableRows
}
exports.handleLongMessage = function(input, message, title){
    let output = input.split(/(?<=\.\s|\n)/), count = 0, acc = ""
    for(let i = 0; i < output.length; i++){
        if((acc + output[i]).length + message.length > 6000){

            break;
            //let message2 = new discord.MessageEmbed().setColor(message.color).setDescription("...continued");
            //acc = output[i]
            //console.log(this.handleLongMessage(acc, message2, title))
        }
        else if((acc + output[i]).length < 1024) acc += `${output[i]}`
        else{
            if(count == 0) message.addField(`__${title}__`, acc)
            else message.addField("_​_", acc)
            count++
            acc = output[i]
        }
        if(i == output.length-1 && acc != "") (count == 0) ? message.addField(`${title}`, acc) : message.addField("_​_", acc)
    }
    return output
}
exports.parseEntry = function(entry, delim){
    output = ""
    for(let i in entry){  
        output += (i > 0) ? `${delim}` : "" 
        if(entry[i].entries){
            output += (entry[i].name) ? `\n***${entry[i].name}.*** ` : ""
            output += this.parseEntry(entry[i].entries, "\n")
        }
        else if(entry[i].items) output += this.parseList(entry[i].items)
        else if(entry[i].type) {
            output += (entry[i].type == "table") ? this.parseTable(entry[i]) : ""
            //output += (entry[i].type == "options") ? this.parseEntry(entry[i].entries, "\n") : ""
        }
        else output += `${entry[i].replace("*", "\\*")}`
    }
    return this.removeTags(output)
}
 exports.parseList =function(list){
    let output = ""
    for(let i in list){
        output += (list[i].name) ? `**${list[i].name}** ` : ""
        if(list[i].entry){
            output +=  (i < list.length-1) ? `${list[i].entry}\n` : `${list[i].entry}`
        } else if(list[i].entries){
            output += `${this.parseEntry(list[i].entries)}\n`;
        } else output += `• ${list[i]}\n`
    }
    return output
}
function filterFunc(regex, input){
    let description = input.toString(), filteredMessage = ""
    var firstRegex = new RegExp("{@" + regex + ".*?}"),
        partialRegex = new RegExp("{@" + regex + " ")
    if(description.match(/{@.*?}/)){
        description.split(/(?={@.*})/).forEach(filter => {
            if(filter.match(firstRegex)){
                let filteredArray
                if(filter.match(/\|.*?}/g)) filteredArray = jsplit(filter.split(partialRegex)[1], /\|.*?}/g, 1);
                else filteredArray = jsplit(filter.split(partialRegex)[1], /}/g, 1);
                filteredArray.forEach(piece =>{ 
                    filteredMessage += piece
                })
            }else filteredMessage += filter
        })
    } else return input
    return filteredMessage
}
function replaceStupidFilters(input){
    let output = input
    output = output.replace(/{@dc/g, "{@dc DC")
                   .replace(/{@hit /g, "{@hit +")
                   .replace(/{@h}/g, "{@h }")
                   .replace(/{@atk mw}/g, "{@atk *Melee Weapon Attack*:} ")
                   .replace(/{@atk rw}/g, "{@atk *Ranged Weapon Attack*:} ")
                   .replace(/{@atk mw,rw}/g, "{@atk *Melee or Ranged Weapon Attack*:} ")
                   .replace(/{@atk ms}/g, "{@atk *Melee Spell Attack*:} ")
                   .replace(/{@atk rs}/g, "{@atk *Ranged Spell Attack*:} ")
                   .replace(/{@recharge/g, "{@recharge Recharge")
                   .replace(/{@scaledamage .*?}/g, `{@scaledamage ${input.match(/(\d*\w*)}/g)}`)

    return output
}
function jsplit(str, sep, n) {
    var out = []
    while(n--) out.push(str.slice(sep.lastIndex, sep.exec(str).index))
    out.push(str.slice(sep.lastIndex))
    return out
}