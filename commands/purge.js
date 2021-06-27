const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function info(client, message, args, language) {
    if (client.trades[message.author.id]) return message.reply(language.trading);
    if (client.sell[message.author.id]) return message.reply(language.selling);
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    try {
        if (!client.purge[message.author.id]) {
            client.purge[message.author.id] = true;
            message.reply(language.purgeWarning);
        }
        else {
            switch (args[0]) {
                case "cancel": {
                    client.purge[message.author.id] = undefined;
                    message.reply(language.deleteCancelled);
                    break;
                }
                default: {
                    var purgeCoins = 0, length = 0;
                    client.purge[message.author.id] = undefined;
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        var waifu = client.economyManager[message.author.id].waifus[i];
                        if (waifu.rarity == "Normal") {
                            var inTeam = false;
                            for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
                                if (client.economyManager[message.author.id].team.members[i] == waifu.id) inTeam = true;
                            }
                            if (!inTeam) {
                                client.economyManager[message.author.id].waifus.splice(i, 1);
                                var level = waifu.level, name = waifu.name, purgeValue = parseInt(500 * (1 + (0.075 * level)));
                                purgeCoins += purgeValue;
                                length++;
                                i--;
                            }
                        }
                    }
                    if (!length) return message.channel.send(new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                    .setDescription(language.noPurgedWaifu)
                    .setTimestamp());
                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                    coins += purgeCoins;
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
                            if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**" + language.transactionID + "** " + result, new Discord.MessageEmbed()
                                .setColor(Math.floor(Math.random() * 16777215))
                                .setAuthor(message.author.username + " has just deleted " + length + " Normal waifus and got " + purgeCoins + " " + client.config.currency + ".", message.author.avatarURL({size: 128}))
                                .setTimestamp()
                            );
                            message.channel.send(new Discord.MessageEmbed()
                            .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                            .setDescription(language.purged.replace("$length", length).replace("$amount", purgeCoins.toLocaleString() + " " + client.config.currency))
                            .setTimestamp());
                        }
                        else {
                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                            return message.reply(language.serverConnectError);
                        }
                    });
                }
            }
        }
    }
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.run = async (client, message, args, language) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
            client.economyManager = JSON.parse(body);
            if (client.economyManager[message.author.id]) {
                info(client, message, args, language);
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
                        info(client, message, args, language);
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
    name: "purge",
    description: "Delete all of your Normal waifus and get a compensation amount",
    usage: require("../config.json").prefix + "purge",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}