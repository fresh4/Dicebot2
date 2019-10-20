exports.rollDiceFunc = function(msg){
    var rollsArray = msg.toString().concat()
                                     .replace(/\-/g,"+-")
                                     .split(/\+/);
    var valueArray = [], displayArray = [], valCount = 0, displayCount = 0, isNegative = false;
    for(var i = 0; i < rollsArray.length; i++){
        if(rollsArray[i].match(/[d]/)){ //if it's a dice roll
            isNegative = false;
            var pre = rollsArray[i].split(/[d]/)[0];
            var suff = parseInt(rollsArray[i].split(/[d]/)[1]);
            if(pre == '') pre = 1;
            else if(pre == '-') pre = -1;
            pre = parseInt(pre);
            if(pre < 0){isNegative = true; pre *= -1;}
            if(rollsArray[i].match(/k[h|l]\d*/) || (rollsArray[i].match(/(adv|dis)/) && rollsArray[i].match(/d20/))){ //if there's any kh/kl request
                var roll;
                if(rollsArray[i].match(/adv/)) roll = this.rollKeepHighestX(pre = 2, suff = 20, 1);
                else if(rollsArray[i].match(/dis/)) roll = this.rollKeepLowestX(pre = 2, suff = 20, 1);
                else if(rollsArray[i].match(/kh\d*/)) roll = this.rollKeepHighestX(pre, suff, rollsArray[i].split(/kh/)[1]);
                else if(rollsArray[i].match(/kl\d*/)) roll = this.rollKeepLowestX(pre, suff, rollsArray[i].split(/kl/)[1]);
                displayArray[displayCount] = "(";
                for(var m = 0; m < pre; m++){
                    if(!roll[m].toString().includes("~")){
                        valueArray[valCount] = roll[m];
                        valCount++;
                    }
                    (m == pre-1) ? displayArray[displayCount] += roll[m] : displayArray[displayCount] += `${roll[m]} + `;
                }
                displayArray[displayCount] += ")";
            }
            else{ //if it's a normal dice roll
                displayArray[displayCount] = "(";
                for(var j = 0; j < pre; j++){
                    valueArray[valCount] = this.RollSingle(suff);
                    if(isNegative){valueArray[valCount] *= -1;}
                    (j == pre-1) ?
                        displayArray[displayCount] += `${valueArray[valCount]}` :
                        displayArray[displayCount] += `${valueArray[valCount]} + `;
                    valCount++;
                }
                displayArray[displayCount] += ")";
            }
        }
        else{ //if we're just adding a modifier
            var modifier = parseInt(rollsArray[i]);
            valueArray[valCount] = modifier;
            displayArray[displayCount] = modifier;
            valCount++;
        }
        displayCount++;
    }
    //add everything up and display it
    var totalNumber = 0, totalDisplay = "";
    valueArray.forEach(value => {
        totalNumber += value;
    })
    for(var i = 0; i < displayArray.length; i++){
        if(i == displayArray.length - 1)
            totalDisplay += displayArray[i];
        else
            totalDisplay += displayArray[i] + " + ";
    }
    if(isNaN(totalNumber)) throw Error;
    return `**${totalNumber}** = ${totalDisplay}`;
}
exports.RollSingle = function(dieSide){
    return Math.floor(Math.random() * dieSide) + 1;
}
exports.RollX = function(num, dieSide){
    let total = 0;
    for(let i in num){
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
    for(var j = pre; j >= keep; j--){
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