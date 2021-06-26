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
    if (message.mentions.users.size) {
        var text = "";
        for (var i = 0; i < args.length; i++) {
            text += args[i] + " ";
        }
        text = text.substr(22, text.length - 1);
        var gifs = ["https://media1.tenor.com/images/0a4bcfa614b64c6bf0bde0f6e11ab53c/tenor.gif?itemid=15566922", "https://media1.tenor.com/images/a730e941a6d2063097ea09c97aca95d6/tenor.gif?itemid=14208654", "https://i.imgur.com/oNcHdPX.gif", "https://thumbs.gfycat.com/CarefulCarefreeFly-size_restricted.gif", "https://i.kym-cdn.com/photos/images/newsfeed/000/974/391/ece.gif", "https://thumbs.gfycat.com/QuaintFavorableAbalone-size_restricted.gif", "https://media1.tenor.com/images/9efb74ad03bb183739c808693a8cd136/tenor.gif?itemid=15626264", "https://gifimage.net/wp-content/uploads/2017/08/muda-muda-muda-gif-11.gif", "https://i.makeagif.com/media/7-14-2016/M_Ad47.gif", "https://thumbs.gfycat.com/EdibleMasculineBlackmamba-size_restricted.gif", "https://media0.giphy.com/media/nyNS6Cfrnkdj2/giphy.gif", "https://gifimage.net/wp-content/uploads/2017/08/muda-muda-muda-gif-17.gif", "https://vignette.wikia.nocookie.net/p__/images/0/09/Tumblr_ps2bdv01it1sh11j9o2_540.gif/revision/latest?cb=20190528062850&path-prefix=protagonist", "https://thumbs.gfycat.com/MediumMeaslyCrayfish-size_restricted.gif", "https://media1.tenor.com/images/e1f9ded7b49c16e1a52f55eec03da065/tenor.gif?itemid=16215899", "https://i.kym-cdn.com/photos/images/original/000/974/103/afd.gif", "https://66.media.tumblr.com/3e8f6e4d052ceeb977ce8f0ac7434fa9/55eafb5ba48a40d2-54/s500x750/88c73ba37b8be10726f3bbc3ac6049461520db64.gifv"];
        const image = {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: message.author.username + ' muda muda-s ' + message.mentions.users.first().username + "\n" + text,
                icon_url: message.author.avatarURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            },
            image: {
                url: gifs[random(0, (gifs.length - 1))],
            },
        };
        message.channel.send({
            embed: image
        });
    } else {
        message.reply("You must mention an user!");
    }
}

module.exports.config = {
    name: "muda",
    description: "\"Muda muda\" someone",
    usage: require("../config.json").prefix + "muda @mention",
    accessableby: "Members",
    aliases: [],
    category: "👋 Interactions",
    dmAvailable: false
}