const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function waifu(client, message, args) {
    if (!client.economyManager["6746"].waifus) client.economyManager["6746"].waifus = [];
    if (!args[0] || !isNaN(args[0])) {
        if (client.economyManager["6746"].waifus.length == 0) return message.reply("There aren't any waifus/husbandos in the BOT's public shop!");
        try {
            var descText = "Use the `wbuy <id>` command to buy a waifu/husbando.\nUse the `wshop <name>` command to search for waifus/husbando that have a specific name.";
            var embed = new Discord.MessageEmbed()
            .setAuthor(client.user.username + " BOT's public shop", client.user.avatarURL({
                size: 128
            }))
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription(descText)
            .setTimestamp();
            var n = 0;
            if (n * 6 > client.economyManager["6746"].waifus.length - 1) return message.reply("There aren't have any more waifus/husbandos in the shop!");
            for (var i = n * 6; i < n * 6 + 6; i++) {
                if (client.economyManager["6746"].waifus[i]) {
                    var waifu = client.economyManager["6746"].waifus[i];
                    embed.addField((i + 1) + ". " + waifu.name, "**Rarity:** " + waifu.rarity.replace("Super Super Rare", "Specially Super Rare") + "\n**Level:** " + waifu.level + "\n**Seller:** " + (client.users.cache.get(waifu.seller) ? client.users.cache.get(waifu.seller).tag : "Unknown") + "\n**Price:** " + waifu.price + " " + client.config.currency, true);
                } else break;
            }
            if ((n + 1) * 6 <= client.economyManager["6746"].waifus.length - 1) descText += "\nUse the `wshop " + (n + 2) + "` command to get to the next page.";
            message.channel.send(embed);
        }
        catch (err) {
            console.error(err);
            return message.reply("An unexpected error occurred.");
        }
    }
    else {
        try {
            var embed = new Discord.MessageEmbed()
            .setAuthor(client.user.username + " BOT's public shop that contains the \"" + args.join(" ") + "\" name", client.user.avatarURL({
                size: 128
            }))
            .setColor(Math.floor(Math.random() * 16777215))
            .setDescription("This message only shows 10 first results. To reduce the search results please search using the full name.\nUse the `wbuy <id>` command to buy a waifu/husbando.")
            .setTimestamp();
            for (var i = 0; i < client.economyManager["6746"].waifus.length; i++) {
                if (client.economyManager["6746"].waifus[i].name.toLowerCase().includes(args.join(" ").toLowerCase()) && length < 10) {
                    length++;
                    var waifu = client.economyManager["6746"].waifus[i];
                    embed.addField((i + 1) + ". " + waifu.name, "**Rarity:** " + waifu.rarity.replace("Super Super Rare", "Specially Super Rare") + "\n**Level:** " + waifu.level + "\n**Seller:** " + (client.users.cache.get(waifu.seller) ? client.users.cache.get(waifu.seller).tag : "Unknown") + "\n**Price:** " + waifu.price + " " + client.config.currency);
                }
            }
            message.channel.send(embed);
        }
        catch (err) {
            console.error(err);
            return message.reply("An unexpected error occurred.");
        }
    }
}

module.exports.run = async (client, message, args) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
            client.economyManager = JSON.parse(body);
            if (client.economyManager[message.author.id]) {
                waifu(client, message, args);
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
                            waifu(client, message, args);
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
                                    waifu(client, message, args);
                                    return;
                                }
                                else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                            });
                        }
                        return;
                    }
                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                });
            }
        }
        else return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
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