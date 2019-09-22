exports.run = (bot, msg, args) => {
    msg.channel.send("pong!").catch(console.error);
}