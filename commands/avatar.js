const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    var member = message.author;
    if (message.mentions.users.size) {
        member = message.mentions.users.first();
    }
    if (!message.mentions.users.size && args[0]) {
        member = client.users.cache.get(args[0]);
    }
    const infoMessage = {
        color: 0x0099ff,
        author: {
            name: member.username + "'s Avatar",
            url: member.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }),
        },
        image: {
            url: member.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            })
        }
    };
    message.channel.send({
        embed: infoMessage
    });
}

module.exports.config = {
    name: "avatar",
    description: "View your or someone's avatar",
    usage: "u!avatar @mention",
    accessableby: "Members",
    aliases: [],
    category: "👥 User information",
    dmAvailable: true
}