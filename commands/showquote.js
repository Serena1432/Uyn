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
    if (message.channel.type == "text") return message.reply("This command now can only be used in a Direct Messages channel!"); 
    var user;
    if (args[0] && message.mentions.users.size) user = message.mentions.users.first();
    else if (args[0] && !message.mentions.users.size) user = client.users.cache.get(args[0]);
    else user = message.author;
    if (!user) return message.reply("Cannot find this user! Please try again!")
    const embed = {
        color: Math.floor(Math.random() * 16777214) + 1,
        description: client.quotes[user.id],
        footer: {
            text: user.tag,
            icon_url: user.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            })
        }
    };
    if (user.id == message.author.id) {
        if (client.quotes[user.id]) {
            message.reply("Here is your ping-responsing message:\nRead more information about ping-responsing messages here:\nhttps://github.com/LilShieru/Uyn/blob/master/README.md#-ping-responsing", {embed: embed});
        } else {
            message.reply("You haven't set any quote yet!");
        }
    } else {
        if (client.quotes[user.id]) {
            message.reply("Here is " + user.username + "'s ping-responsing message:\nRead more information about ping-responsing messages here:\nhttps://github.com/LilShieru/Uyn/blob/master/README.md#-ping-responsing", {embed: embed});
        } else {
            message.reply(user.username + " hasn't set any quote yet!");
        }
    }
}

module.exports.config = {
    name: "showquote",
    description: "View your current ping-responsing message",
    usage: require("../config.json").prefix + "showquote",
    accessableby: "Members",
    aliases: [],
    category: "💬 Ping-responsing",
    dmAvailable: true
}