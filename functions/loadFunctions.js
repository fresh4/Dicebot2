var fs = require('fs')

exports.loadClassFeatures = function(){
    let classes = {"classfeatures":[]};
    fs.readdir("./5eTools/data/class/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".json") || !file.startsWith('class-') || file.match("sidekick") || file.match('generic')) return;
            classes.classfeatures = classes.classfeatures.concat(require(`../5eTools/data/class/${file}`).classFeature)
        });
    });
    return classes
}

exports.loadSubclassFeatures = function(){
    let classes = {"subclassfeatures":[]};
    fs.readdir("./5eTools/data/class/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".json") || !file.startsWith('class-') || file.match("sidekick") || file.match('generic')) return;
            classes.subclassfeatures = classes.subclassfeatures.concat(require(`../5eTools/data/class/${file}`).subclassFeature)
        });
    });
    return classes
}

exports.loadClasses = function(){
    let classes = {"class":[]};
    fs.readdir("./5eTools/data/class/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".json") || !file.startsWith('class-') || file.match("sidekick") || file.match('generic')) return;
            classes.class = classes.class.concat(require(`../5eTools/data/class/${file}`).class)
        });
    });
    return classes;
}

exports.loadSubClasses = function(){
    let subclasses = {"subclass":[]};
    fs.readdir("./5eTools/data/class/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".json") || !file.startsWith('class-') || file.match("sidekick") || file.match('generic')) return;
            subclasses.subclass = subclasses.subclass.concat(require(`../5eTools/data/class/${file}`).subclass)
        });
    });
    return subclasses
}
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
    items.item = items.item.concat(require(`../5eTools/data/items-base.json`).baseitem)
    return items;
}