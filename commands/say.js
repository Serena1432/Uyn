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
        message.channel.send(args.join(" "));
    } else {
        message.reply('You must type the content first!');
    }
}

module.exports.config = {
    name: "say",
    description: "Make the BOT say anything",
    usage: require("../config.json").prefix + "say (content)",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: true
}