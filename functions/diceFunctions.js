exports.rollDiceFunc = function(msg){
    var splitMessage = msg.toString().concat();
        splitMessage = splitMessage.replace(/\-/g,"+-");
        splitMessage = splitMessage.split(/\+/);
        var valueArray = [], displayArray = [], tempMessage = splitMessage, valCount = 0, displayCount = 0, isNegative = false;
        for(var i = 0; i < splitMessage.length; i++){
            if(splitMessage[i].match(/[d]/)){
                isNegative = false;
                var pre = tempMessage[i].split(/[d]/)[0];
                var suff = parseInt(tempMessage[i].split(/[d]/)[1]);
                if(pre == '') pre = 1;
                else if(pre == '-') pre = -1;
                pre = parseInt(pre);
                if(pre < 0){isNegative = true; pre *= -1;}
                if(splitMessage[i].match(/kh\d*/) || (splitMessage[i].match(/adv/) && splitMessage[i].match(/d20/))){
                    var roll;
                    if(splitMessage[i].match(/adv/)) roll = this.rollKeepHighestX(pre = 2, suff = 20, 1);
                    else roll = this.rollKeepHighestX(pre, suff, splitMessage[i].split(/kh/)[1]);
                    displayArray[displayCount] = "(";
                    for(var m = 0; m < pre; m++){
                        if(!roll[m].toString().includes("~")){
                            valueArray[valCount] = roll[m];
                            valCount++;
                        }
                        if(m == pre-1)
                            displayArray[displayCount] += roll[m];
                        else 
                            displayArray[displayCount] += `${roll[m]} + `;
                    }
                    displayArray[displayCount] += ")";
                } else if(splitMessage[i].match(/kl\d*/) || (splitMessage[i].match(/dis/) && splitMessage[i].match(/d20/))){
                    var roll;
                    if(splitMessage[i].match(/dis/)) roll = this.rollKeepLowestX(pre = 2, suff = 20, 1);
                    else roll = this.rollKeepLowestX(pre, suff, splitMessage[i].split(/kl/)[1]);
                    displayArray[displayCount] = "(";
                    for(var m = 0; m < pre; m++){
                        if(!roll[m].toString().includes("~")){
                            valueArray[valCount] = roll[m];
                            valCount++;
                        }
                        if(m == pre-1)
                            displayArray[displayCount] += roll[m];
                        else 
                            displayArray[displayCount] += `${roll[m]} + `;
                    }
                    displayArray[displayCount] += ")";
                }
                else{
                    displayArray[displayCount] = "(";
                    for(var j = 0; j < pre; j++){
                        valueArray[valCount] = this.RollSingle(suff);
                        if(isNegative){valueArray[valCount] *= -1;}
                        if(j == pre-1)
                            displayArray[displayCount] += `${valueArray[valCount]}`
                        else
                            displayArray[displayCount] += `${valueArray[valCount]} + `;
                        valCount++;
                    }
                    displayArray[displayCount] += ")";
                }
            }
            else{
                var normalNumber = parseInt(splitMessage[i]);
                valueArray[valCount] = normalNumber;
                displayArray[displayCount] = normalNumber;
                valCount++;
            }
            displayCount++;
        }
        var totalNumber = 0, totalDisplay = "";
        for(var i = 0; i < valueArray.length; i++){
            totalNumber += valueArray[i];
        }
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
    var final;
    var roll = Math.floor(Math.random() * dieSide) + 1;
        final = roll;
    return final;
}
exports.rollKeepHighestX = function(pre, suff, keep){
    var arrayOfResults = [], tempSortedArray = [];
    for(var i = 0; i < pre; i++){
        arrayOfResults[i] = this.RollSingle(suff);
    }
    tempSortedArray = this.bubbleSort(arrayOfResults);
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
    tempSortedArray = this.bubbleSort(arrayOfResults);
    for(var j = pre; j >= keep; j--){
        arrayOfResults[arrayOfResults.indexOf(tempSortedArray[j])] = `~~${arrayOfResults[arrayOfResults.indexOf(tempSortedArray[j])]}~~`;
    }
    return arrayOfResults;
}
exports.bubbleSort = function(arr) { 
    var n = arr.length, tempArr = arr.concat(); 
    for (var i = 0; i < n-1; i++) 
        for (var j = 0; j < n-i-1; j++) 
            if (tempArr[j] > tempArr[j+1]) { 
                // swap arr[j+1] and arr[i] 
                var temp = tempArr[j]; 
                tempArr[j] = tempArr[j+1]; 
                tempArr[j+1] = temp; 
            }
    return tempArr;
} 