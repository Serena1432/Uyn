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
        if (args[1]) {
            var creatingMsg = await message.channel.send("Creating certificate, please wait...");
            var text = "";
            var d = new Date();
            var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            var today = new Date(utc + (3600000 * 7));
            for (var i = 0; i < args.length - 1; i++) {
                text += args[(i + 1)] + " ";
            }
            text = text.substr(0, text.length - 1).replace("undefined", "");
            var guildName = message.guild.name,
                username = message.author.username,
                membername = message.mentions.users.first().username,
                certname = text.replace("undefined", "");
            const canvas = Canvas.createCanvas(960, 686);
            const ctx = canvas.getContext('2d');

            const background = await Canvas.loadImage('https://png.pngtree.com/thumb_back/fw800/back_pic/04/49/81/43585bdca2c7673.jpg');
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            const avatar = await Canvas.loadImage(message.guild.iconURL({
                format: "png",
                dynamic: true,
                size: 2048
            }));
            ctx.drawImage(avatar, 100, 94, 95, 95);

            ctx.font = '20px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "center";
            ctx.fillText(guildName, 592, 100, 564, 40);
            ctx.fillText("--------------------------------", 592, 120, 564, 40);

            ctx.font = 'bold 40px Times New Roman';
            ctx.fillStyle = '#FF0000';
            ctx.fillText("CERTIFICATE", 592, 200, 564, 40);
            ctx.font = '20px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText("My name is: ", 299, 240, 564, 40);
            ctx.font = 'bold 20px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText(username, 429, 240, 564, 40);
            ctx.font = '20px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText("Recognized a member: ", 299, 270, 564, 40);
            ctx.font = 'bold 20px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText(membername, 529, 270, 564, 40);
            ctx.font = '20px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText("Won the title of: ", 299, 300, 564, 40);
            ctx.font = 'bold 20px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText(certname.replace("undefined", ""), 469, 300, 564, 40);
            ctx.font = '20px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText("Year: ", 299, 330, 564, 40);
            ctx.font = 'bold 20px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText(today.getFullYear(), 359, 330, 564, 40);
            ctx.font = '14px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText("Decision number 69/QĐ-HVN-0609 made on 3/4/2020", 53, 411, 564, 40);
            ctx.font = '14px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText("Certificate number 01", 53, 431, 564, 40);
            ctx.font = '14px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "right";
            ctx.fillText(guildName + ", " + today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear(), 904, 411, 564, 40);
            ctx.font = 'bold 17px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "center";
            ctx.fillText('Creator', 757, 441, 286, 40);
            ctx.font = '14px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "center";
            ctx.fillText(username, 757, 471, 286, 40);
            ctx.fillText('Signed!', 757, 501, 286, 40);
            ctx.font = '14px SF Pro Text';
            ctx.fillStyle = '#000000';
            ctx.textAlign = "left";
            ctx.fillText("Certificate was created by Uyn BOT (made by. " + client.devUsername + ")", 56, 633, 564, 40);

            message.channel.send("Successfully created the certificate!").then(msg => {
                creatingMsg.delete();
                msg.delete({
                    timeout: 5000
                })
            });
            message.channel.send('', {
                files: [{
                    attachment: canvas.toBuffer(),
                    name: 'certificate.png'
                }]
            });
        } else {
            message.reply("You must type a certificate name!");
        }
    } else {
        message.reply(language.pleaseMentionUser);
    }
}

module.exports.config = {
    name: "cert",
    description: "Give someone a certificate about something",
    usage: require("../config.json").prefix + "cert @mention (name)",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: false
}