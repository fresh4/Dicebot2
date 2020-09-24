var discord = require('discord.js')
exports.run = (bot, msg, args) => {

    let embed = new discord.MessageEmbed();
    let invite = "https://discordapp.com/oauth2/authorize?client_id=392081019798421515&scope=bot&permissions=0";

    embed.setTitle(`Click here to invite me to your server`)
         .setURL(`${invite}`)
         .setThumbnail(bot.user.avatarURL())
         .setAuthor(msg.author.username, msg.author.avatarURL())
         .setFooter(`Join the other ${bot.guilds.cache.size} servers and invite me!`, bot.user.avatarURL())
         .setColor("33D7FF")

    msg.channel.send(embed)
}
module.exports.help = {
    name: "invite",
    category: "Administrative",
    description: "Invite me to another server!",
    detailedDesc: "",
    usage: "invite"
}