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

function buy(client, message, args, item) {
    if (!client.economyManager[message.author.id].inventory) client.economyManager[message.author.id].inventory = [];
    var has = false;
    for (var i = 0; i < client.economyManager[message.author.id].inventory.length; i++) {
        if (client.economyManager[message.author.id].inventory[i] == item.code) has = true;
    }
    if (has) return message.reply("You have already had this item!");
    var inv = {
        type: client.config.currency,
        cash: parseInt(decrypt(client.economyManager[message.author.id].coins))
    };
    if (item.price_type == "message_points") {
        inv.type = "💬 Message Points";
        inv.cash = parseInt(decrypt(client.economyManager[message.author.id].messagePoints))
    }
    if (!client.economyManager[message.author.id].coins) return message.reply("Cannot get the coins information.");
    if (inv.cash < item.price) return message.reply("Insufficent **" + inv.type + "**!");
    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
    if (item.price_type == "message_points") coins = parseInt(decrypt(client.economyManager[message.author.id].messagePoints));
    coins -= item.price;
    if (item.price_type == "message_points") client.economyManager[message.author.id].messagePoints = encrypt(coins.toString());
    else client.economyManager[message.author.id].coins = encrypt(coins.toString());
    var length = client.economyManager[message.author.id].inventory.length;
    client.economyManager[message.author.id].inventory.push(item.code);
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
            if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**Transaction ID:** " + result, new Discord.MessageEmbed()
                .setColor(Math.floor(Math.random() * 16777215))
                .setAuthor(message.author.username + " has just bought \"" + item.name + "\" item from the shop for " + item.price + " " + inv.type + ".", message.author.avatarURL({size: 128}))
                .setTimestamp()
            );
            else console.log("Cannot get the log channel.");
            const embed = {
                color: Math.floor(Math.random() * 16777215),
                author: {
                    name: "Succesfully bought the \"" + item.name + "\" item.",
                    icon_url: message.author.avatarURL({size: 128})
                },
                description: "**Description:**\n" + item.description + "\n**Transaction ID:**\n" + result + "\nYou should remember this ID and send this to the BOT developer if something wrong happened.",
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
            return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
        }
    });
}

module.exports.run = async (client, message, args) => {
    try {
        var items = require("../items.json");
        if (items.length == 0) return message.reply("There aren't any items in the BOT's shop!");
        if (!args[0]) return message.reply("Please specify the code of at item!");
        var item;
        for (var i = 0; i < items.length; i++) {
            if (items[i].code == args[0]) item = items[i];
        }
        if (!item) return message.reply("Invalid item code!");
        if (client.economyManager[message.author.id]) {
            buy(client, message, args, item);
            return;
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Error")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            buy(client, message, args, item);
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
                                        buy(client, message, args, item);
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                });
                        }
                    }
                    catch (err) {
                        console.error(err);
                        return message.reply("An unexpected error occurred.");
                    }
                }
                else return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
            });
        }
    }
    catch (err) {
        console.error(err);
        return message.reply("An unexpected error occurred.");
    }
}

module.exports.config = {
    name: "buy",
    description: "Buy an item in the BOT's shop",
    usage: require("../config.json").prefix + "buy <id>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}