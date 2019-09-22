var dice = require('./diceFunctions.js')
exports.rollStats = function(){
    var score = new Array(0, 0, 0, 0, 0, 0);
    var stat = [];
    for(var j = 0; j < 6; j++){
        for(var i = 0; i < 4; i++)
            stat[i] = dice.RollSingle(6);
        stat.sort();
        stat.shift();
        for(var x = 0; x < 3; x++)
            score[j] += stat[x];
    }
    var total = this.totalModifierSum(this.calculateModifier(score));
    if(total < 0){
        score = rollStats();
    }
    return score;
}
exports.totalModifierSum = function(mods){
    var total = 0;
    for(var i = 0; i < 6; i++){
        total += mods[i];
    }
    return total;
}
exports.calculateModifier = function(score){
    var mods = new Array(0,0,0,0,0,0);
    for(var i = 0; i <6; i++){
        mods[i] = Math.floor((score[i])/2-5);
    }
    return mods;
}
exports.totalModMessage = function(mods){
    var total = this.totalModifierSum(mods);
    if(total < 4)
        return `Your total modifier is ${total}; you may be too weak, consider rerolling.`;
    else if(total > 7)
        return `Your total modifier is ${total}; you may be too strong, consider rerolling.`;
    else 
        return `Your total modifier is ${total}`;
}