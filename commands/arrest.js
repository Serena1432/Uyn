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
    message.delete({
        timeout: 10000
    });
    if (message.mentions.users.size) {
        if (message.mentions.users.first().id != message.author.id) {
            var creatingMsg = await message.channel.send(language.creatingImage);
            const canvas = Canvas.createCanvas(600, 400);
            const ctx = canvas.getContext('2d');

            const background = await Canvas.loadImage('./assets/arrest.png');
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            const vavatar = await Canvas.loadImage(message.mentions.users.first().avatarURL({
                format: "png",
                dynamic: true,
                size: 256
            }));
            ctx.drawImage(vavatar, 282, 33, 107, 107);

            const p2avatar = await Canvas.loadImage(message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 256
            }));
            ctx.drawImage(p2avatar, 450, 0, 140, 140);
            message.channel.send(message.mentions.users.first().toString() + language.haveBeenCaught + message.author.toString() + "!", {
                files: [{
                    attachment: canvas.toBuffer(),
                    name: message.author.username + '_arrests_' + message.mentions.users.first().username + '.png'
                }]
            });
            creatingMsg.delete();
        } else {
            message.reply(language.arrestedYourself);
        }
    } else {
        message.reply(language.pleaseMentionUser);
    }
}

module.exports.config = {
    name: "arrest",
    description: "Arrest someone (in Vietnamese Police Style)",
    usage: require("../config.json").prefix + "arrest @mention",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}