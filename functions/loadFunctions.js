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