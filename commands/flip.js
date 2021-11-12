exports.run = (bot, msg, args) => {
    msg.channel.send(((Math.floor(Math.random() * 2) + 1) == 1) ? "Heads" : "Tails")
}
module.exports.help = {
    name: "flip",
    category: "Rolling",
    description: "Flips a coin.",
    detailedDesc: "",
    usage: "flip"
}