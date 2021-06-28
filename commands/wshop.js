const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function waifu(client, message, args, language) {
    if (!client.economyManager["6746"].waifus) client.economyManager["6746"].waifus = [];
    if (!args[0] || !isNaN(args[0])) {
        if (client.economyManager["6746"].waifus.length == 0) return message.reply(language.noWshopItem);
        try {
            var descText = language.wshopInstructions;
            var n = parseInt(args[0]) - 1 || 0;
            if ((n + 1) * 6 <= client.economyManager["6746"].waifus.length - 1) descText += language.wshopNextPage.replace("$page", n + 2);
            var embed = new Discord.MessageEmbed()
            .setAuthor(language.wshopTitle.replace("$bot", client.user.username), client.user.avatarURL({
                size: 128
            }))
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(descText)
            .setTimestamp();
            if (n * 6 > client.economyManager["6746"].waifus.length - 1) return message.reply(language.noMoreWshopItem);
            for (var i = n * 6; i < n * 6 + 6; i++) {
                if (client.economyManager["6746"].waifus[i]) {
                    var waifu = client.economyManager["6746"].waifus[i];
                    embed.addField((i + 1) + ". " + waifu.name, language.rarity + " " + waifu.rarity.replace("Super Super Rare", "Specially Super Rare") + "\n**" + language.level + "** " + waifu.level + "\n**" + language.seller + "** " + (client.users.cache.get(waifu.seller) ? client.users.cache.get(waifu.seller).tag : "Unknown") + "\n**" + language.price + ":** " + waifu.price.toLocaleString() + " " + client.config.currency, true);
                } else break;
            }
            message.channel.send(embed);
        }
        catch (err) {
            console.error(err);
            return message.reply(language.unexpectedErrorOccurred);
        }
    }
    else {
        try {
            var embed = new Discord.MessageEmbed()
            .setAuthor(language.wshopSearchTitle.replace("$bot", client.user.username).replace("$name", args.join(" ")), client.user.avatarURL({
                size: 128
            }))
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(language.wshopSearchInstructions)
            .setTimestamp();
            var length = 0;
            for (var i = 0; i < client.economyManager["6746"].waifus.length; i++) {
                if (client.economyManager["6746"].waifus[i].name.toLowerCase().includes(args.join(" ").toLowerCase()) && length < 10) {
                    length++;
                    var waifu = client.economyManager["6746"].waifus[i];
                    embed.addField((i + 1) + ". " + waifu.name, language.rarity + " " + waifu.rarity.replace("Super Super Rare", "Specially Super Rare") + "\n**" + language.level + "** " + waifu.level + "\n**" + language.seller + "** " + (client.users.cache.get(waifu.seller) ? client.users.cache.get(waifu.seller).tag : "Unknown") + "\n**" + language.price + ":** " + waifu.price.toLocaleString() + " " + client.config.currency, true);
                }
            }
            message.channel.send(embed);
        }
        catch (err) {
            console.error(err);
            return message.reply(language.unexpectedErrorOccurred);
        }
    }
}

module.exports.run = async (client, message, args, language) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
            client.economyManager = JSON.parse(body);
            if (client.economyManager[message.author.id]) {
                waifu(client, message, args, language);
                return;
            }
            else {
                client.economyManager[message.author.id] = {
                    coins: encrypt("500"),
                    waifus: []
                };
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "add",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        if (client.economyManager["6746"]) {
                            waifu(client, message, args, language);
                            return;
                        }
                        else {
                            client.economyManager["6746"] = {
                                waifus: []
                            };
                            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                type: "add",
                                token: process.env.php_server_token,
                                id: "6746",
                                data: JSON.stringify(client.economyManager["6746"])
                            }}, function(error, response, body) {
                                if (!error && response.statusCode == 200 && body.includes("Success")) {
                                    waifu(client, message, args, language);
                                    return;
                                }
                                else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                return message.reply(language.serverConnectError);
                            });
                        }
                        return;
                    }
                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                    return message.reply(language.serverConnectError);
                });
            }
        }
        else return message.reply(language.serverConnectError);
    });
}

module.exports.config = {
    name: "wshop",
    description: "Visit the BOT's public waifu shop",
    usage: require("../config.json").prefix + "wshop <page>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}
