exports.run = (bot, msg, args) => {
    var result = Math.floor(Math.random() * 2) + 1;
    if(result == 1) msg.channel.send("Heads");
    else msg.channel.send("Tails");
}
module.exports.help = {
    name: "flip",
    category: "Rolling",
    description: "Flips a coin.",
    detailedDesc: "",
    usage: "flip"
}