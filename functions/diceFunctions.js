var Math = require("mathjs");

exports.rollDiceFunc = function(msg){
    var diceRegex = new RegExp(/(\d*D\d*(?:kh|kl|adv|dis)?\d*)/, 'gi');
    var splitByDiceString = msg.split(diceRegex), 
        bareDiceStringMath = splitByDiceString.slice(),
        displayArray = splitByDiceString.slice(),
        result;
    for(let i in splitByDiceString){
        if(splitByDiceString[i].toString().match(diceRegex)){
            var result = this.rollDiceString(splitByDiceString[i]);
            if(Array.isArray(result)){
                displayArray[i] = "(";
                bareDiceStringMath[i] = "";
                let tempArr = [];
                for(let j in result){
                    if(!result[j].toString().includes("~")){
                        tempArr.push(result[j]);
                    }
                    (j == result.length-1) ? displayArray[i] += result[j] : displayArray[i] += `${result[j]} + `;
                }
                for(let j in tempArr){
                    (j == tempArr.length-1) ? bareDiceStringMath[i] += tempArr[j] : bareDiceStringMath[i] += `${tempArr[j]} + `;
                }
                displayArray[i] += ")";
            }else {
                displayArray[i] = `(${result})`;
                bareDiceStringMath[i] = Math.evaluate(result);
            }
        }
    }
    bareDiceStringMath = bareDiceStringMath.join('');
    displayArray = displayArray.join('');
    try{
        result = Math.evaluate(bareDiceStringMath);
    }catch(error){
        return
    }
    return `**${result}** = ${displayArray}`;
}
exports.rollDiceString = function(roll){
    roll = roll.toString();
    var pre = parseInt(roll.split(/[d]/)[0]);
    var suff = parseInt(roll.split(/[d]/)[1]);
    if(isNaN(pre)) pre = 1
    var result = "";
    if(roll.match(/k[h|l]\d*/) || roll.match(/d20(adv|dis)/)){
        if(roll.match(/adv/)) result = this.rollKeepHighestX(pre = 2, suff = 20, 1);
        else if(roll.match(/dis/)) result = this.rollKeepLowestX(pre = 2, suff = 20, 1);
        else if(roll.match(/kh\d*/)) result = this.rollKeepHighestX(pre, suff, roll.split(/kh/)[1]);
        else if(roll.match(/kl\d*/)) result = this.rollKeepLowestX(pre, suff, roll.split(/kl/)[1]);
    } else{
        for(let i = 0; i < pre; i++){
            if(i == pre-1) result += `${this.RollSingle(suff)}`;
            else result += `${this.RollSingle(suff)} + `;
        }
    }
    return result;
}
exports.RollSingle = function(dieSide){
    return Math.floor(Math.random() * dieSide) + 1;
}
exports.RollX = function(num, dieSide){
    let total = 0;
    for(let i = 0; i < num; i++){
        total += this.RollSingle(dieSide);
    }
    return total;
}
exports.rollKeepHighestX = function(pre, suff, keep){
    var arrayOfResults = [], tempSortedArray = [];
    for(var i = 0; i < pre; i++){
        arrayOfResults[i] = this.RollSingle(suff);
    }
    tempSortedArray = bubbleSort(arrayOfResults);
    for(var j = 0; j < pre-keep; j++){
        arrayOfResults[arrayOfResults.indexOf(tempSortedArray[j])] = `~~${arrayOfResults[arrayOfResults.indexOf(tempSortedArray[j])]}~~`;
    }
    return arrayOfResults;
}
exports.rollKeepLowestX = function(pre, suff, keep){
    var arrayOfResults = [], tempSortedArray = [];
    for(var i = 0; i < pre; i++){
        arrayOfResults[i] = this.RollSingle(suff);
    }
    tempSortedArray = bubbleSort(arrayOfResults);
    for(var j = pre-1; j >= keep; j--){
        arrayOfResults[arrayOfResults.indexOf(tempSortedArray[j])] = `~~${arrayOfResults[arrayOfResults.indexOf(tempSortedArray[j])]}~~`;
    }
    return arrayOfResults;
}
function bubbleSort(arr) { 
    var n = arr.length, tempArr = arr.concat(); 
    for (var i = 0; i < n-1; i++) 
        for (var j = 0; j < n-i-1; j++) 
            if (tempArr[j] > tempArr[j+1]) 
                [tempArr[j], tempArr[j+1]] = [tempArr[j+1], tempArr[j]]
    return tempArr;
} 