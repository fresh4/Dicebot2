var fs = require('fs')
exports.loadBestiary = function(){
    let bestiary = {"monster": []};
    fs.readdir("./5eTools/data/bestiary/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".json") || !file.startsWith('bestiary-')) return;
            bestiary.monster = bestiary.monster.concat(require(`../5eTools/data/bestiary/${file}`).monster)
        });
    });
    return bestiary;
}
exports.loadSpells = function(){
    let spells = {"spell": []};
    fs.readdir("./5eTools/data/spells/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".json") || !file.startsWith('spells-')) return;
            spells.spell = spells.spell.concat(require(`../5eTools/data/spells/${file}`).spell)
        });
    });
    return spells;
}

exports.loadItems = function(){
    let items = {"item": []};
    items.item = items.item.concat(require(`../5eTools/data/items.json`).item);
    items.item = items.item.concat(require(`../5eTools/data/items.json`).itemGroup)
    items.item = items.item.concat(require(`../5eTools/data/magicvariants.json`).variant)
    return items;
}