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
    if (message.mentions.users.size == 0) {
        if (client.quotes[message.author.id]) {
            message.reply("Your current ping-responsing quote is `" + client.quotes[message.author.id] + "`.");
        } else {
            message.reply("You haven't set any quote yet!");
        }
    } else {
        if (client.quotes[message.mentions.users.first().id]) {
            message.reply(message.mentions.users.first().username + "'s current ping-responsing message is `" + client.quotes[message.mentions.users.first().id] + "`.");
        } else {
            message.reply(message.mentions.users.first().username + " hasn't set any quote yet!");
        }
    }
}

module.exports.config = {
    name: "showquote",
    description: "View your current ping-responsing message",
    usage: "u!showquote",
    accessableby: "Members",
    aliases: [],
    category: "💬 Ping-responsing",
    dmAvailable: true
}