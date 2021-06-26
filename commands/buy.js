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

function buy(client, message, args, language, item) {
    if (!client.economyManager[message.author.id].inventory) client.economyManager[message.author.id].inventory = [];
    var has = false;
    for (var i = 0; i < client.economyManager[message.author.id].inventory.length; i++) {
        if (client.economyManager[message.author.id].inventory[i] == item.code) has = true;
    }
    if (has) return message.reply(language.itemAlreadyHave);
    var inv = {
        type: client.config.currency,
        cash: parseInt(decrypt(client.economyManager[message.author.id].coins))
    };
    if (item.price_type == "message_points") {
        inv.type = "💬 " + language.messagePoints + "";
        inv.cash = parseInt(decrypt(client.economyManager[message.author.id].messagePoints))
    }
    if (!client.economyManager[message.author.id].coins) return message.reply(language.coinError);
    if (item.type == "leveling_ticket") {
        if (args[1] && isNaN(args[1])) return message.reply(language.quantityIsNaN);
        if (inv.cash < item.price * (args[1] ? parseInt(args[1]) : 1)) return message.reply(language.insufficent + " **" + inv.type + "**!");
    }
    else if (inv.cash < item.price) return message.reply(language.insufficent + " **" + inv.type + "**!");
    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
    if (item.price_type == "message_points") coins = parseInt(decrypt(client.economyManager[message.author.id].messagePoints));
    coins -= item.price * (args[1] ? parseInt(args[1]) : 1);
    if (item.price_type == "message_points") client.economyManager[message.author.id].messagePoints = encrypt(coins.toString());
    else client.economyManager[message.author.id].coins = encrypt(coins.toString());
    var length = client.economyManager[message.author.id].inventory.length;
    if (item.type == "leveling_ticket") {
        if (!client.economyManager[message.author.id].leveling_tickets) client.economyManager[message.author.id].leveling_tickets = {};
        eval("if (!client.economyManager[message.author.id].leveling_tickets." + item.code + ") client.economyManager[message.author.id].leveling_tickets." + item.code + " = (args[1] ? parseInt(args[1]) : 1); else client.economyManager[message.author.id].leveling_tickets." + item.code + " += (args[1] ? parseInt(args[1]) : 1);");
    }
    else client.economyManager[message.author.id].inventory.push(item.code);
    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
        type: "update",
        token: process.env.php_server_token,
        id: message.author.id,
        data: JSON.stringify(client.economyManager[message.author.id])
    }}, function(error, response, body) {
        if (!error && response.statusCode == 200 && body.includes("Success")) {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let result = "";
            for (let i = 0; i < 32; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**" + language.transactionID + "** " + result, new Discord.MessageEmbed()
                .setColor(Math.floor(Math.random() * 16777215))
                .setAuthor(message.author.username + " has just bought " + (args[1] ? parseInt(args[1]) : "a") + " \"" + item.name + "\" item" + (parseInt(args[1]) > 1 ? "s" : "") + " from the shop for " + item.price + " " + inv.type + ".", message.author.avatarURL({size: 128}))
                .setTimestamp()
            );
            else console.log("Cannot get the log channel.");
            const embed = {
                color: Math.floor(Math.random() * 16777215),
                author: {
                    name: language.itemBought.replace("$item", item.name),
                    icon_url: message.author.avatarURL({size: 128})
                },
                description: "**" + language.descriptionEmbedField + "**\n" + item.description + "\n**" + language.transactionID + "**\n" + result + "\n" + language.transactionNotice + "",
                timestamp: new Date()
            };
            message.channel.send({
                embed: embed
            });
        }
        else {
            var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
            if (item.price_type == "message_points") coins = parseInt(decrypt(client.economyManager[message.author.id].messagePoints));
            coins += item.price;
            if (item.price_type == "message_points") client.economyManager[message.author.id].messagePoints = encrypt(coins.toString());
            else client.economyManager[message.author.id].coins = encrypt(coins.toString());
            client.economyManager[message.author.id].inventory.splice(length, 1);
            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
            return message.reply(language.serverConnectError);
        }
    });
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
        if (item.type == "gacha_ticket") return message.reply(language.cantBuyItem)
        if (client.economyManager[message.author.id]) {
            buy(client, message, args, language, item);
            return;
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            buy(client, message, args, language, item);
                            return;
                        }
                        else {
                                client.economyManager[message.author.id] = {
                                    coins: encrypt("500"),
                                    inventory: []
                                };
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: message.author.id,
                                    data: JSON.stringify(client.economyManager[message.author.id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        buy(client, message, args, language, item);
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                });
                        }
                    }
                    catch (err) {
                        console.error(err);
                        return message.reply(language.unexpectedErrorOccurred);
                    }
                }
                else return message.reply(language.serverConnectError);
            });
        }
    }
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.config = {
    name: "buy",
    description: "Buy an item in the BOT's shop",
    usage: require("../config.json").prefix + "buy <id> <quantity>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}
