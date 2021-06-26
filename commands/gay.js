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
    const mess = {
        color: Math.floor(Math.random() * 16777214) + 1,
        title: 'The Gay Certificate',
        description: message.author.username + ' proves him/herself as a gay!',
        footer: {
            text: '- Signed by ' + message.author.username + ' -'
        },
    };
    message.channel.send({
        embed: mess
    });
}

module.exports.config = {
    name: "gay",
    description: "Proves yourself as a gay",
    usage: require("../config.json").prefix + "gay",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}