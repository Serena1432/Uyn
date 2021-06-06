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
        const canvas = Canvas.createCanvas(759, 427);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage('./assets/dancing_coffin.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const vavatar = await Canvas.loadImage(message.mentions.users.first().avatarURL({
            format: "png",
            dynamic: true,
            size: 256
        }));
        ctx.drawImage(vavatar, 107, 44, 220, 220);
        creatingMsg.delete();
        message.channel.send(message.mentions.users.first().toString() + ", Rest In Peace.", {
            files: [{
                attachment: canvas.toBuffer(),
                name: 'coffin_dance_' + message.mentions.users.first().username + '.png'
            }]
        });
    } else {
        message.reply("You must mention an user!");
    }
}

module.exports.config = {
    name: "coffindance",
    description: "Make a Coffin Dance Meme about someone",
    usage: require("../config.json").prefix + "coffindance @mention",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}