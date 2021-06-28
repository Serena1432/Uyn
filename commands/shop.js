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
        var n = 0;
        if (args[0]) n = parseInt(args[0]) - 1;
        var descText = "`-------------------------------------------------------------\n| ID    ";
        if (language.itemName.length <= 29) {
            descText += " | " + language.itemName;
            for (var j = 0; j < 29 - language.itemName.length; j++) descText += " ";
        }
        else descText += " | " + language.itemName.substr(0, 26) + "...";
        if (language.price.length <= 16) {
            descText += " | " + language.price;
            for (var j = 0; j < 16 - language.price.length; j++) descText += " ";
        }
        else descText += " | " + language.price.substr(0, 13) + "...";
		descText += " |\n-------------------------------------------------------------";
        if (n * 10 > items.length - 1) return message.reply(language.noMoreBOTShopItem);
        for (var i = n * 10; i < n * 10 + 10; i++) {
            if (items[i]) {
                switch (items[i].type) {
                    case "background": {
                        var name = language.bannerImageItem.replace("$name", items[i].name);
                        descText += "\n| " + items[i].code;
                        for (var j = 0; j < 6 - items[i].code.length; j++) descText += " ";
                        if (name.length <= 29) {
                            descText += " | " + name;
                            for (var j = 0; j < 29 - name.length; j++) descText += " ";
                        }
                        else descText += " | " + name.substr(0, 26) + "...";
                        var price = items[i].price + ((items[i].price_type == "currency") ? client.config.currency : "💬 " + language.messagePoints + "");
                        if (price.length <= 16) {
                            descText += " | " + price;
                            for (var j = 0; j < 16 - price.length; j++) descText += " ";
                        }
                        else descText += " | " + price.substr(0, 13) + "...";
                        descText += " |";
                        descText += "\n-------------------------------------------------------------";
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
                        var price = items[i].price + ((items[i].price_type == "currency") ? client.config.currency : "💬 " + language.messagePoints + "");
                        if (price.length <= 16) {
                            descText += " | " + price;
                            for (var j = 0; j < 16 - price.length; j++) descText += " ";
                        }
                        else descText += " | " + price.substr(0, 13) + "...";
                        descText += " |";
                        descText += "\n-------------------------------------------------------------";
                        break;
                    }
                }
            } else break;
        }
        descText += language.shopInstructions;
        if ((n + 1) * 10 <= items.length - 1) descText += language.shopNextPage.replace("$page", n + 2);
        const embed = {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: language.shopTitle.replace("$name", client.user.username),
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
        return message.reply(language.unexpectedErrorOccurred);
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