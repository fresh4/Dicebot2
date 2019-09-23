var bestiary = require('../functions/loadFunctions.js').loadBestiary();

exports.run = (bot, msg, args) => {
    try{
        let monsters = bestiary.monster;
        monsters.forEach(monster => {
            if(monster.name.toLowerCase().split(" ").toString() == args.toString()){
                console.log("FOUND!");
            }
        })
    }
    catch(Error){
        console.log(Error);
    }
}