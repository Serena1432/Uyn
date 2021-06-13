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

module.exports.run = async (client, message, args) => {
    try {
        var items = require("../items.json");
        if (items.length == 0) return message.reply("There aren't any items in the BOT's shop!");
        var n = 0;
        if (args[0]) n = parseInt(args[0]) - 1;
        var descText = "";
        if (n * 3 > items.length - 1) return message.reply("There aren't any more items in the BOT's shop!");
        for (var i = n * 3; i < n * 3 + 3; i++) {
            if (items[i]) {
                switch (items[i].type) {
                    case "background": {
                        descText += "**" + (i + 1) + ". \"" + items[i].name + "\" banner image**\n**Description:**\n" + items[i].description + "\n\n**Price:** " + items[i].price + " " + ((items[i].price_type == "currency") ? client.config.currency : "💬 Message Points") + "\nUse the `preview " + items[i].code + "` command to preview this banner image.\nUse the `buy " + items[i].code + "` command to buy this item.\n\n";;
                        break;
                    }
                }
            } else break;
        }
        if ((n + 1) * 3 <= items.length - 1) descText += "Use the `shop " + (n + 2) + "` command to get to the next page.";
        const embed = {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: "List of " + client.user.username + " items",
                icon_url: client.user.avatarURL({
                    size: 128
                })
            },
            description: descText,
            timestamp: new Date()
        };
        message.channel.send({
            embed: embed
        });
    }
    catch (err) {
        console.error(err);
        return message.reply("An unexpected error occurred.");
    }
}

module.exports.config = {
    name: "shop",
    description: "Open the BOT's shop",
    usage: require("../config.json").prefix + "shop <page>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}