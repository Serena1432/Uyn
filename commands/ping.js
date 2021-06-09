const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    message.delete({
        timeout: 10000
    });
    var dated = new Date();
    message.reply('Pong!\nRespond Time: ' + (dated.getTime() - message.createdTimestamp) + ' ms');
}

module.exports.config = {
    name: "ping",
    description: "Test the BOT's Response Time",
    usage: require("../config.json").prefix + "ping",
    accessableby: "Members",
    aliases: [],
    category: "🤖 BOT information",
    dmAvailable: true
}