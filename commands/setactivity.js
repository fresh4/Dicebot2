exports.run = (bot, msg, args) => {
    if(msg.author.id.toString() != bot.config.owner) return;
    else bot.user.setActivity(msg.content.split(`${this.help.name} `)[1])
}
module.exports.help = {
    name: "setactivity",
    category: "IGNORE",
    description: "Sets the bots game.",
    detailedDesc: "",
    usage: "setactivity <string>"
}