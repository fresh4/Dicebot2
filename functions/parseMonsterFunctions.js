exports.parseDescriptor = function(monster){
    let size = convertSize(monster.size);
    let alignment = convertAlignment(monster.alignment);
    let type = convertType(monster.type);
    return `${size} ${type}, ${alignment}`
}

function convertSize(input){
    let size = "";
    switch(input){
        case "T": size = "Tiny"; break;
        case "S": size = "Small"; break;
        case "M": size = "Medium"; break;
        case "L": size = "Large"; break;
        case "H": size = "Huge"; break;
        case "G": size = "Gargantuan"; break;
    }
    return size;
}
function convertAlignment(input){

}
function convertType(input){
    if(input.tags) return `${input.type} (${input.tags[0]})`
    else return input.type
}