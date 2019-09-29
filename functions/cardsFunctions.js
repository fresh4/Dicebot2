var cardMap = new Map();
var localCards = new Array;
var cards = ["♠1", "♠2", "♠3", "♠4", "♠5", "♠6", "♠7", "♠8", "♠9", "♠10", "♠K", "♠Q", "♠J", 
             "♣1", "♣2", "♣3", "♣4", "♣5", "♣6", "♣7", "♣8", "♣9", "♣10", "♣K", "♣Q", "♣J", 
             "♥1", "♥2", "♥3", "♥4", "♥5", "♥6", "♥7", "♥8", "♥9", "♥10", "♥K", "♥Q", "♥J", 
             "♦1", "♦2", "♦3", "♦4", "♦5", "♦6", "♦7", "♦8", "♦9", "♦10", "♦K", "♦Q", "♦J"];

exports.getCards = function(){
    return cards
}
exports.getCardMap = function(get){
    return cardMap.get(get)
}
exports.setCardMap = function(key, value){
    return cardMap.set(key, value)
}
exports.getGlobalCards = function(){
    return cards.slice();
}