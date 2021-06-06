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
    const mess = {
        color: Math.floor(Math.random() * 16777214) + 1,
        title: 'The Lesbian Certificate',
        description: message.author.username + ' proves him/herself as a lesbian!',
        footer: {
            text: '- Signed by ' + message.author.username + ' -'
        },
    };
    message.channel.send({
        embed: mess
    });
}

module.exports.config = {
    name: "les",
    description: "Proves yourself as a lesbian",
    usage: require("../config.json").prefix + "les",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}