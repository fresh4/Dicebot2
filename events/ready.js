module.exports = (bot) => {
    for(guild of bot.guilds.cache){
        guild[1].members.fetch()
    }
    var d = new Date();
    const cron = require('../cron.js').cronify(bot);

    console.log(`Logged in and ready to roll on ${bot.guilds.cache.size} servers!\n${d.toDateString()} ${d.toTimeString()}`)
    bot.user.setActivity(`with your fate | !help`)
}