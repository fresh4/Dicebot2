var RNG = require('./diceFunctions.js');
exports.rollTable = function(table, diceType){
    let roll = RNG.RollSingle(diceType)
    for(let i in table){
        if(table[i].min && table[i].max){
            if(table[i].min <= roll && roll <= table[i].max){
                if(table[i].result) return table[i].result
                else if(table[i].item) return table[i].item
                else if(table[i].choose) return (table[i].choose.fromGeneric || "")
            }
        }
    }
}