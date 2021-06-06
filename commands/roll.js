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
        title: 'Tha Uyn BOT rolled a number:',
        description: '**' + random(0, 99) + '**',
        footer: {
            text: 'Congratulations to members who have this number!'
        },
    };
    message.channel.send({
        embed: mess
    });
}

module.exports.config = {
    name: "roll",
    description: "Roll a number between 0 and 99",
    usage: require("../config.json").prefix + "roll",
    accessableby: "Members",
    aliases: ["xoso"],
    category: "😊 Just for fun",
    dmAvailable: false
}