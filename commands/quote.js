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
        const mess = {
            color: Math.floor(Math.random() * 16777214) + 1,
            description: '"' + args.join(" ") + '"',
            footer: {
                text: '- ' + message.author.username
            }
        };
        message.channel.send({
            embed: mess
        });
    } else {
        message.reply(language.missingContent);
    }
}

module.exports.config = {
    name: "quote",
    description: "Turn your message into a quote box",
    usage: require("../config.json").prefix + "quote (content)",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}