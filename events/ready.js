module.exports = (bot) => {
    console.log(`Logged in and ready to roll on ${bot.guilds.size} servers!`)
    bot.user.setActivity(`with your fate | !help`)
}