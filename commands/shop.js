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
        var descText = "`-------------------------------------------------------------\n| Code   | Item name                     | Price            |\n-------------------------------------------------------------";
        if (n * 10 > items.length - 1) return message.reply("There aren't any more items in the BOT's shop!");
        for (var i = n * 10; i < n * 10 + 10; i++) {
            if (items[i]) {
                switch (items[i].type) {
                    case "background": {
                        var name = "\"" + items[i].name + "\" Banner Image";
                        descText += "\n| " + items[i].code;
                        for (var j = 0; j < 6 - items[i].code.length; j++) descText += " ";
                        if (name.length <= 29) {
                            descText += " | " + name;
                            for (var j = 0; j < 29 - name.length; j++) descText += " ";
                        }
                        else descText += " | " + name.substr(0, 26) + "...";
                        var price = items[i].price + ((items[i].price_type == "currency") ? client.config.currency : "💬 Message Points");
                        if (price.length <= 16) {
                            descText += " | " + price;
                            for (var j = 0; j < 16 - price.length; j++) descText += " ";
                        }
                        else descText += " | " + price.substr(0, 13) + "...";
                        descText += " |";
                        break;
                    }
                    case "leveling_ticket": {
                        descText += "\n| " + items[i].code;
                        for (var j = 0; j < 6 - items[i].code.length; j++) descText += " ";
                        if (items[i].name.length <= 29) {
                            descText += " | " + items[i].name;
                            for (var j = 0; j < 29 - items[i].name.length; j++) descText += " ";
                        }
                        else descText += " | " + items[i].name.substr(0, 26) + "...";
                        var price = items[i].price + ((items[i].price_type == "currency") ? client.config.currency : "💬 Message Points");
                        if (price.length <= 16) {
                            descText += " | " + price;
                            for (var j = 0; j < 16 - price.length; j++) descText += " ";
                        }
                        else descText += " | " + price.substr(0, 13) + "...";
                        descText += " |";
                        break;
                    }
                }
                descText += "\n-------------------------------------------------------------";
            } else break;
        }
        descText += "`\nUse the `preview <code>` command to preview a banner image.\nUse the `buy <code>` command to buy an item.\n";
        if ((n + 1) * 10 <= items.length - 1) descText += "Use the `shop " + (n + 2) + "` command to get to the next page.";
        const embed = {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: "List of " + client.user.username + "'s items",
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