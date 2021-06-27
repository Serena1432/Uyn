const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");
const Canvas = require("canvas");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args, language) => {
    if (!args[0]) return message.reply(language.missingContent);
        message.channel.send({
            embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: language.reversed.replace("$name", message.author.username),
                    icon_url: message.author.avatarURL({
                        format: "png",
                        dynamic: true,
                        size: 2048
                    })
                },
                fields: [{
                        name: language.originalMessage,
                        value: args.join(" "),
                        inline: false
                    },
                    {
                        name: language.reversedMessage,
                        value: args.join(" ").split("").reverse().join(""),
                        inline: false
                    }
                ]
            }
        });
}

module.exports.config = {
    name: "reverse",
    description: "Reverse some text",
    usage: require("../config.json").prefix + "reverse (content)",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: true
}