var RNG = require('./diceFunctions.js');
exports.rollTable = function(table, diceType){
    let roll = RNG.RollSingle(diceType)
    for(let i in table){
        if(table[i].min && table[i].max){
            if(table[i].min <= roll && roll <= table[i].max){
                return table[i].result
            }
        }
    }
}