const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args, language) => {
    message.delete({
        timeout: 10000
    });
    if (args[0]) {
        var text = "";
        for (var i = 0; i < args.length; i++) {
            text += args[i] + " ";
        }
        text = text.substr(0, text.length - 1);
        message.channel.send(text + '\n(Requested by ' + message.author.toString() + ')\n:thumbsup: **Yes**\n:thumbsdown: **No**').then(async msg => {
            await msg.react('👍');
            await msg.react('👎');
        });
    } else {
        message.reply('You must type the content first!!');
    }
}

module.exports.config = {
    name: "poll",
    description: "Create a Yes/No Poll",
    usage: require("../config.json").prefix + "poll (content)",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}