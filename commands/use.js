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

function use(client, message, args) {
    var items = require("../items.json");
    if (args[0] != "bgdf") {
        if (!client.economyManager[message.author.id].inventory) client.economyManager[message.author.id].inventory = [];
        if (!args[0]) return message.reply("Please specify the code of an item!");
        if (client.economyManager[message.author.id].inventory.length == 0) return message.reply("You don't have this item in the inventory!");
        var item;
        for (var i = 0; i < items.length; i++) {
            if (items[i].code == args[0]) item = items[i];
        }
        if (!item) return message.reply("Invalid item code!");
        var has = false;
        for (var i = 0; i < client.economyManager[message.author.id].inventory.length; i++) {
            if (client.economyManager[message.author.id].inventory[i] == args[0]) has = true;
        }
        if (!has) return message.reply("You don't have this item in the inventory!");
        switch (item.type) {
            case "background": {
                var formerBackground = "background_default";
                if (client.economyManager[message.author.id].background) formerBackground = client.economyManager[message.author.id].background;
                if (formerBackground == item.background_image) return message.reply("You are already using this profile banner image!");
                client.economyManager[message.author.id].background = item.background_image;
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "update",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        const embed = {
                            color: Math.floor(Math.random() * 16777215),
                            description: "**Disclaimer:** Neither the developer nor the submitter is the real creator of these banner images. All of the rights belong to their respective creators or owners."
                        };
                        return message.reply("Successfully changed your profile banner image into **" + item.name + "**.\nUse the command `use bgdf` to change your profile banner image into the default one.", {embed: embed});
                    }
                    else {
                        client.economyManager[message.author.id].background = formerBackground;
                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                    }
                });
                break;
            }
            default: {
                message.reply("The usage of another item type isn't supported yet!");
                break;
            }
        }
    }
    else {
        var formerBackground = "background_default";
        if (client.economyManager[message.author.id].background) formerBackground = client.economyManager[message.author.id].background;
        if (formerBackground == "background_default") return message.reply("You are already using this profile banner image!");
        client.economyManager[message.author.id].background = "background_default";
        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
            type: "update",
            token: process.env.php_server_token,
            id: message.author.id,
            data: JSON.stringify(client.economyManager[message.author.id])
        }}, function(error, response, body) {
            if (!error && response.statusCode == 200 && body.includes("Success")) {
                return message.reply("Successfully changed your profile banner image into the default image.");
            }
            else {
                client.economyManager[message.author.id].background = formerBackground;
                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
            }
        });
    }
}

module.exports.run = async (client, message, args) => {
    try {
        if (client.economyManager[message.author.id]) {
            use(client, message, args);
            return;
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Error")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            use(client, message, args);
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
                                        use(client, message, args);
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
    name: "use",
    description: "Use an item",
    usage: require("../config.json").prefix + "use <code>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: false
}