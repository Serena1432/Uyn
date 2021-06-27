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
    if (args[0] && args[1]) {
        if (!isNaN(args[0]) && isNaN(args[1])) {
            message.channel.send(random(parseInt(args[0]), parseInt(args[1])));
        } catch {
            message.channel.send(language.rangeIsNaN);
        }
    } else {
        message.reply(language.missingNumberRange);
    }
}

module.exports.config = {
    name: "number",
    description: "Randomize a number range",
    usage: require("../config.json").prefix + "number min max",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}