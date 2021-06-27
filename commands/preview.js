const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {
    encrypt,
    decrypt
} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args, language) => {
    try {
        var items = require("../items.json");
        if (items.length == 0) return message.reply(language.noBOTShopItem);
        if (!args[0]) return message.reply(language.specifyCode);
        var item;
        for (var i = 0; i < items.length; i++) {
            if (items[i].code == args[0]) item = items[i];
        }
        if (!item) return message.reply(language.invalidItemCode);
        if (item.type != "background") return message.reply(language.notABannerImage);
        const file = new Discord.MessageAttachment("./assets/" + item.background_image + ".png");
        const embed = {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: language.bannerImagePreview.replace("$item", item.name),
                icon_url: client.user.avatarURL({
                    size: 128
                })
            },
            image: {
                url: "attachment://" + item.background_image + ".png"
            },
            timestamp: new Date()
        };
        message.channel.send({
            files: [file],
            embed: embed
        });
    }
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.config = {
    name: "preview",
    description: "Preview a banner image",
    usage: require("../config.json").prefix + "preview <code>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: false
}