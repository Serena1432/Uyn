const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    message.delete({
        timeout: 10000
    });
    var channelText = language.listChannels + message.guild.name + ":**",
        id = 0,
        i = 0;
    await message.guild.channels.cache.forEach(channel => {
        i++;
        if (i == 10) {
            message.author.send(channelText);
            channelText = "";
            i = 0
        }
        id++;
        var jd = message.channel.createdAt;
        var createdDate = jd.getDate() + "/" + (jd.getMonth() + 1) + "/" + jd.getFullYear() + "; " + jd.getHours() + ":" + jd.getMinutes() + ":" + jd.getSeconds() + " (GMT +0)";
        channelText += "\n**" + id + ". " + channel.name + "**\nID: " + channel.id + "\n" + language.createdAt + ": " + createdDate + "\n" + language.channelType + ": " + channel.type;
    });
    if (message.guild.channels.cache.size % 10 != 0 || message.guild.channels.cache.size < 10) message.author.send(channelText);
    message.reply(language.dmMessageSent);
}

module.exports.config = {
    name: "channels",
    description: "List of all of this server's channels",
    usage: require("../config.json").prefix + "channels",
    accessableby: "Members",
    aliases: [],
    category: "🚩 Server information",
    dmAvailable: false
}