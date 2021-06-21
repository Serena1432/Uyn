const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function roll(client, message, args) {
    if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < 1000) return message.reply("Insufficent balance!");
    if (!client.countdown[message.author.id] || client.countdown[message.author.id] < (new Date()).getTime()) {
        try {
            if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
            if (!client.economyManager[message.author.id].waifus.length >= 75) return message.reply("You have exceeded the maximum limit of waifus in an account!")
            var random = Math.random(), waifu, length = client.economyManager[message.author.id].waifus.length, rarity, type;
            if (random < 0.8) {
                rarity = "Normal";
                if (Math.random() <= 0.5) {
                    waifu = client.waifus.normal[Math.floor(Math.random() * client.waifus.normal.length)];
                    type = "Waifu";
                }
                else {
                    waifu = client.husbandos.normal[Math.floor(Math.random() * client.husbandos.normal.length)];
                    type = "Husbando";
                }
            }
            else if (random >= 0.8 && random < 0.9) {
                rarity = "Rare";
                if (Math.random() <= 0.5) {
                    waifu = client.waifus.rare[Math.floor(Math.random() * client.waifus.rare.length)];
                    type = "Waifu";
                }
                else {
                    waifu = client.husbandos.rare[Math.floor(Math.random() * client.husbandos.rare.length)];
                    type = "Husbando";
                }
            }
            else if (random >= 0.9 && random < 0.95) {
                rarity = "Super Rare";
                if (Math.random() <= 0.5) {
                    waifu = client.waifus.srare[Math.floor(Math.random() * client.waifus.srare.length)];
                    type = "Waifu";
                }
                else {
                    waifu = client.husbandos.srare[Math.floor(Math.random() * client.husbandos.srare.length)];
                    type = "Husbando";
                }
            }
            else if (random >= 0.95 && random < 0.98) {
                waifu = client.waifus.ssrare[Math.floor(Math.random() * client.waifus.ssrare.length)];
                rarity = "Super Super Rare";
                type = "Waifu";
            }
            else {
                waifu = client.waifus.urare[Math.floor(Math.random() * client.waifus.urare.length)];
                rarity = "Ultra Rare";
                type = "Waifu";
            }
            client.economyManager[message.author.id].waifus.push({
                name: waifu.name,
                anime: waifu.anime,
                image_url: waifu.image_url,
                base_hp: waifu.base_hp,
                base_atk: waifu.base_atk,
                base_def: waifu.base_def,
                base_exp: waifu.base_exp,
                level: 1,
                exp: 0,
                max_exp: waifu.base_exp,
                rarity: rarity
            });
            var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
            coins -= 1000;
            client.economyManager[message.author.id].coins = encrypt(coins.toString());
            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                type: "update",
                token: process.env.php_server_token,
                id: message.author.id,
                data: JSON.stringify(client.economyManager[message.author.id])
            }}, function(error, response, body) {
                client.countdown[message.author.id] = (new Date()).getTime() + 15000;
                if (!error && response.statusCode == 200 && body.includes("Success")) {
                    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    let result = "";
                    for (let i = 0; i < 32; i++) {
                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                    }
                    if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**Transaction ID:** " + result, new Discord.MessageEmbed()
                        .setColor(Math.floor(Math.random() * 16777215))
                        .setAuthor(message.author.username + " has just lost 1000 Uyncoins for rolling a waifu/husbando.", message.author.avatarURL({size: 128}))
                        .setTimestamp()
                    );
                    message.channel.send("**" + message.author.username + "** spent **1000 " + client.config.currency + "** and rolled a " + rarity + " " + type + ":", new Discord.MessageEmbed()
                    .setDescription("**" + waifu.name + "**\n" + waifu.anime)
                    .setImage(waifu.image_url)
                    .setTimestamp());
                }
                else {
                    coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                    coins += 1000;
                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                    client.economyManager[message.author.id].waifus.splice(length, 1);
                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                }
            });
        }
        catch (err) {
            console.error(err);
            message.reply("An unexpected error occurred.");
        }
    } else {
        var totalSeconds = (client.countdown[message.author.id] - (new Date()).getTime()) / 1000;
        var days = parseInt(totalSeconds / 86400);
        var hours = parseInt((totalSeconds - days * 86400) / 3600);
        var minutes = parseInt((totalSeconds - days * 86400 - hours * 3600) / 60);
        var seconds = parseInt(totalSeconds - days * 86400 - hours * 3600 - minutes * 60);
        var timeText = "";
        if (days > 0) timeText += days + "d ";
        if (hours > 0) timeText += hours + "h ";
        if (minutes > 0) timeText += minutes + "m ";
        if (seconds > 0) timeText += seconds + "s ";
        return message.reply("You have to wait **" + timeText + "**to do this again!");
    }
}

module.exports.run = async (client, message, args) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Error")) {
            client.economyManager = JSON.parse(body);
            if (client.economyManager[message.author.id]) {
                roll(client, message, args);
                return;
            }
            else {
                client.economyManager[message.author.id] = {
                    coins: encrypt("500"),
                    waifus: [],
                };
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "add",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        roll(client, message, args);
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
    name: "roll",
    description: "Roll a random waifu",
    usage: require("../config.json").prefix + "roll",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: false
}