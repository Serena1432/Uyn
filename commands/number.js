const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args) => {
    message.delete({
        timeout: 10000
    });
    if (args[0] && args[1]) {
        try {
            message.channel.send(random(parseInt(args[0]), parseInt(args[1])));
        } catch {
            message.channel.send("There is a serious error while executing your command! Please type only two numbers and try again!");
        }
    } else {
        message.reply('Bạn cần nhập 2 số trước! Ví dụ như `number 6 9`');
    }
}

module.exports.config = {
    name: "number",
    description: "Randomize a number range",
    usage: "u!number min max",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}