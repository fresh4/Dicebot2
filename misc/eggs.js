exports.eastereggs = function(bot, msg){
    if(msg.channel.id == "316969268145160200"){
        let homebrew = ["looking for","feed","anyone have","criticism","assistance","?", "help"];
        for(var i = 0; i < homebrew.length; i++){
            if(msg.content.includes(homebrew[i])){
                msg.reply("This is a friendly reminder that this channel is for completed submissions only. If you would like feedback on your content, please post it in " + bot.channels.find("name","dming_questions") + " or one of the dojos. Thank you!");
                return;
            }
        }
    }
    if(msg.content.includes("love") && msg.content.includes("bot")) msg.channel.send(":heart:") 
    if(msg.content.includes("omae wa mou shindeiru")) msg.channel.send("NANI?!?");
    if(msg.content.includes("notice me senpai")) msg.channel.send(":eyes:");
    if(msg.content.match(/\bbot\b|\bdicebot\b/) && msg.content.match(/\bthank(s?)\b/)) msg.channel.send(":thumbsup:");
    if(msg.content.match(/\bbot\b|\bdicebot\b/) && msg.content.match(/\bhi\b|\bhey\b/)) msg.channel.send("hey bb");
    if(msg.content == `${bot.prefix}lenny`) msg.channel.send("( ͡͡ ° ͜ ʖ ͡ °)");
}