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

function use(client, message, args, language) {
    var items = require("../items.json");
    if (args[0] != "bgdf") {
        if (!client.economyManager[message.author.id].inventory) client.economyManager[message.author.id].inventory = [];
        if (!args[0]) return message.reply(language.specifyCode);
        var item;
        for (var i = 0; i < items.length; i++) {
            if (items[i].code == args[0]) item = items[i];
        }
        if (!item) return message.reply(language.invalidItemCode);
        var has = false;
        if (item.type == "leveling_ticket") {
            if (eval("client.economyManager[message.author.id].leveling_tickets." + item.code)) has = true;
        }
        else {
            for (var i = 0; i < client.economyManager[message.author.id].inventory.length; i++) {
                if (client.economyManager[message.author.id].inventory[i] == args[0]) has = true;
            }
        }
        if (!has) return message.reply(language.notInInventory);
        switch (item.type) {
            case "background": {
                var formerBackground = "background_default";
                if (client.economyManager[message.author.id].background) formerBackground = client.economyManager[message.author.id].background;
                if (formerBackground == item.background_image) return message.reply(language.imageAlreadySet);
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
                            description: language.disclaimer
                        };
                        return message.reply(language.imageChanged.replace("$item", item.name), {embed: embed});
                    }
                    else {
                        client.economyManager[message.author.id].background = formerBackground;
                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply(language.serverConnectError);
                    }
                });
                break;
            }
            case "leveling_ticket": {
                if (!args[1]) return message.reply(language.noWaifuID);
                if (isNaN(args[1])) return message.reply(language.waifuIsNaN);
                if (args[2] && isNaN(args[2])) return message.reply(language.quantityIsNaN);
                var waifu, quantity = args[2] ? parseInt(args[2]) : 1;
                if (eval("client.economyManager[message.author.id].leveling_tickets." + item.code) < quantity) return message.reply(language.notEnoughTickets);
                for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                    if (client.economyManager[message.author.id].waifus[i].id == args[1]) {
                        waifu = client.economyManager[message.author.id].waifus[i];
                        break;
                    }
                }
                if (!waifu) return message.reply(language.invalidWaifu);
                eval("client.economyManager[message.author.id].leveling_tickets." + item.code + " -= quantity");
                var exp = item.exp_points * quantity;
                while (exp > 0) {
                    if (parseInt(waifu.max_exp) - waifu.exp > exp) {
                        waifu.exp += exp;
                        exp = 0;
                    }
                    else {
                        exp -= parseInt(waifu.max_exp) - waifu.exp;
                        waifu.level++;
                        waifu.exp = 0;
                        waifu.max_exp = parseInt(waifu.base_exp * (1 + 0.15 * (waifu.level - 1)));
                    }
                }
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
                        if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**ID:** " + result, new Discord.MessageEmbed()
                            .setColor(Math.floor(Math.random() * 16777215))
                            .setAuthor(message.author.username + " has just leveled up his/her waifu using a leveling ticket.", message.author.avatarURL({size: 128}))
                            .setTimestamp()
                        );
                        else console.log("Cannot get the log channel.");
                        const embed = {
                            color: Math.floor(Math.random() * 16777215),
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.avatarURL({size: 128})
                            },
                            description: language.ticketUsed.replace("$quantity", (quantity > 1 ? quantity : language.a)).replace("$item", item.name).replace("$waifu", waifu.name).replace("$exp", (item.exp_points * quantity).toLocaleString()) + "\n\n**" + language.transactionID + "**\n" + result + "\n" + language.transactionNotice + "",
                            timestamp: new Date()
                        };
                        message.channel.send({embed: embed});
                    }
                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                });
                break;
            }
            case "gacha_ticket": {
                return message.reply(language.gachaTicketNotSupported);
                break;
            }
            default: {
                message.reply(language.anotherItemNotSupported);
                break;
            }
        }
    }
    else {
        var formerBackground = "background_default";
        if (client.economyManager[message.author.id].background) formerBackground = client.economyManager[message.author.id].background;
        if (formerBackground == "background_default") return message.reply(language.imageAlreadySet);
        client.economyManager[message.author.id].background = "background_default";
        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
            type: "update",
            token: process.env.php_server_token,
            id: message.author.id,
            data: JSON.stringify(client.economyManager[message.author.id])
        }}, function(error, response, body) {
            if (!error && response.statusCode == 200 && body.includes("Success")) {
                return message.reply(language.defaultImageChanged);
            }
            else {
                client.economyManager[message.author.id].background = formerBackground;
                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                return message.reply(language.serverConnectError);
            }
        });
    }
}

module.exports.run = async (client, message, args, language) => {
    try {
        if (client.economyManager[message.author.id]) {
            use(client, message, args, language);
            return;
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            use(client, message, args, language);
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
                                        use(client, message, args, language);
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
    name: "use",
    description: "Use an item",
    usage: require("../config.json").prefix + "use <code>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}
