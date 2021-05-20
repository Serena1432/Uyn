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

module.exports.run = async (client, message, args) => {
    if (!args[0]) return message.reply("You must type the content first!");
        message.channel.send({
            embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: "Succesfully reversed " + message.author.username + "'s message.",
                    icon_url: message.author.avatarURL({
                        format: "png",
                        dynamic: true,
                        size: 2048
                    })
                },
                fields: [{
                        name: "Original message:",
                        value: args.join(" "),
                        inline: false
                    },
                    {
                        name: "Reversed message:",
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
    usage: "u!reverse (content)",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: true
}