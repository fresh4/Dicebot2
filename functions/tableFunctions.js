var RNG = require('./diceFunctions.js');
exports.rollTable = function(table, diceType){
    let roll = RNG.RollSingle(diceType)
    for(let i in table){
        if(table[i].max != undefined && table[i].max == 0) table[i].max = 100
        if(table[i].min && table[i].max){
            if(table[i].min <= roll && roll <= table[i].max){
                if(table[i].result) return table[i].result
                else if(table[i].item) return table[i].item
                else if(table[i].choose) {
                    if(table[i].choose.fromGeneric)
                        return (table[i].choose.fromGeneric)
                    else if(table[i].choose.fromGroup)
                        return (table[i].choose.fromGroup || "")
                }
            }
        }
    }
}