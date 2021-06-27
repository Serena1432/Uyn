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
        message.channel.send(text + '\n(' + language.requestedBy + ' ' + message.author.toString() + ')\n:thumbsup: **' + language.yes + '**\n:thumbsdown: **' + language.no + '**').then(async msg => {
            await msg.react('👍');
            await msg.react('👎');
        });
    } else {
        message.reply(language.missingContent);
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