const fs = require('fs');

exports.cards = ["♠1", "♠2", "♠3", "♠4", "♠5", "♠6", "♠7", "♠8", "♠9", "♠10", "♠K", "♠Q", "♠J",
    "♣1", "♣2", "♣3", "♣4", "♣5", "♣6", "♣7", "♣8", "♣9", "♣10", "♣K", "♣Q", "♣J",
    "♥1", "♥2", "♥3", "♥4", "♥5", "♥6", "♥7", "♥8", "♥9", "♥10", "♥K", "♥Q", "♥J",
    "♦1", "♦2", "♦3", "♦4", "♦5", "♦6", "♦7", "♦8", "♦9", "♦10", "♦K", "♦Q", "♦J"];

exports.getCards = function () {
    return this.cards
}

exports.getCardMap = function (id) {
    // gets the cards from a stored file
    const data = JSON.parse(
        fs.readFileSync('./server_data/cards.json', 'utf-8', () => { }
        ).toString())
    return data[id]
}

exports.setCardMap = function (key, value) {
    //writes the card map into a file
    let cardJson = JSON.parse(fs.readFileSync('./server_data/cards.json', 'utf-8', () => { }).toString())
    cardJson[key] = value
    return fs.writeFileSync('./server_data/cards.json', JSON.stringify(cardJson, null, 4), (e) => { })
}

exports.getGlobalCards = function () {
    return this.cards.slice();
}

exports.drawCards = (key, cardsToDraw) => {
    // convert text to icons
    cardsToDraw = this.convertSuiteToIcon(cardsToDraw)

    // remove those cards from thingy
    let newCardList = this.getCardMap(key).filter((e) => !cardsToDraw.includes(e))
    this.setCardMap(key, newCardList)
}

exports.insertCards = (key, cardsToInsert) => {
    // convert text to icons
    cardsToInsert = this.convertSuiteToIcon(cardsToInsert)
    let newCardList = this.getCardMap(key)

    // add cards if and only if those cards are in the allowed cards map
    // and if card is not already in the current deck
    for (let idx in cardsToInsert) {
        let card = cardsToInsert[idx]
        if (this.cards.includes(card) && !newCardList.includes(card))
            newCardList.push(card)
    }

    this.setCardMap(key, newCardList)
}

exports.convertSuiteToIcon = (cardList) => {
    for (let idx in cardList) {
        //make this shorter?
        cardList[idx] = cardList[idx].toLowerCase();
        cardList[idx] = cardList[idx].replace("s", "♠")
        cardList[idx] = cardList[idx].replace("c", "♣")
        cardList[idx] = cardList[idx].replace("h", "♥")
        cardList[idx] = cardList[idx].replace("d", "♦")
        cardList[idx] = cardList[idx].toUpperCase();
    }
    return cardList
}