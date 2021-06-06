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
        title: 'The Trap Certificate',
        description: message.author.username + ' proves him/herself as a trap!',
        footer: {
            text: '- Signed by ' + message.author.username + ' -'
        },
    };
    message.channel.send({
        embed: mess
    });
}

module.exports.config = {
    name: "trap",
    description: "Proves yourself as a trap",
    usage: require("../config.json").prefix + "trap",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}