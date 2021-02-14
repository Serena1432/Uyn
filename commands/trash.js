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
    message.delete({
        timeout: 10000
    });
    if (message.mentions.users.size) {
        var creatingMsg = await message.channel.send("Creating images, please wait...");
        const canvas = Canvas.createCanvas(846, 861);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage('./assets/trash.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const vavatar = await Canvas.loadImage(message.mentions.users.first().avatarURL);
        ctx.drawImage(vavatar, 258, 0, 243, 243);

        const p2avatar = await Canvas.loadImage(message.author.avatarURL);
        ctx.drawImage(p2avatar, 368, 430, 181, 181);
        creatingMsg.delete();
        message.channel.send(message.mentions.users.first().toString() + " have been trashed by " + message.author.toString() + "!", {
            files: [{
                attachment: canvas.toBuffer(),
                name: message.mentions.users.first().username + '_is_Trash.png'
            }]
        });
    } else {
        message.reply("You must mention an user!");
    }
}

module.exports.config = {
    name: "trash",
    description: "Throw someone into the trash",
    usage: "u!trash @mention",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}