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

function inventory(client, message, args) {
    try {
        var items = require("../items.json");
        if (!client.economyManager[message.author.id].inventory) client.economyManager[message.author.id].inventory = [];
        if (client.economyManager[message.author.id].inventory.length == 0) return message.reply("You don't have anything in the inventory!");
        var n = 0;
        if (args[0]) n = parseInt(args[0]) - 1;
        var descText = "";
        if (n * 3 > client.economyManager[message.author.id].inventory.length - 1) return message.reply("There aren't any more items in you inventory!");
        for (var i = n * 3; i < n * 3 + 3; i++) {
            if (client.economyManager[message.author.id].inventory[i]) {
                for (var j = 0; j < items.length; j++) {
                    if (items[j].code == client.economyManager[message.author.id].inventory[i]) {
                        var item = items[j];
                        switch (item.type) {
                            case "background": {
                                descText += "**`" + item.code + "` \"" + item.name + "\" banner image**\n**Description:**\n" + item.description + "\n\nUse the `preview " + item.code + "` command to preview this banner image.\nUse the `use " + item.code + "` command to buy this item.\n\n";;
                                break;
                            }
                        }
                    }
                }
            } else break;
        }
        if ((n + 1) * 3 <= client.economyManager[message.author.id].inventory.length - 1) descText += "Use the `inventory " + (n + 2) + "` command to get to the next page.";
        const embed = {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: message.author.username + "'s inventory",
                icon_url: message.author.avatarURL({
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

module.exports.run = async (client, message, args) => {
    try {
        if (client.economyManager[message.author.id]) {
            inventory(client, message, args);
            return;
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Error")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            inventory(client, message, args);
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
                                        inventory(client, message, args);
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
    name: "inventory",
    description: "View your inventory",
    usage: require("../config.json").prefix + "inventory <page>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}