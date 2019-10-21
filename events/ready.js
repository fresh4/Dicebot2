module.exports = (bot) => {
    var d = new Date();
    console.log(`Logged in and ready to roll on ${bot.guilds.size} servers!\n${d.toDateString()} ${d.toTimeString()}`)
    bot.user.setActivity(`with your fate | !help`)
}