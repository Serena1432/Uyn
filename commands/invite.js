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
        title: client.user.username + ' BOT\'s Invite Link',
        description: '[Invite this BOT](https://discord.com/oauth2/authorize?client_id=' + client.user.id + '&scope=bot&permissions=271707254) | [Support Server](https://discord.gg/v9c27j9CQ6)',
        footer: {
            text: 'Thank you so much!'
        },
    };
    message.channel.send({
        embed: mess
    });
}

module.exports.config = {
    name: "invite",
    description: "Get the BOT's invite link",
    usage: require("../config.json").prefix + "invite",
    accessableby: "Members",
    aliases: [],
    category: "🤖 BOT information",
    dmAvailable: true
}