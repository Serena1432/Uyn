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
        if (!client.divorce[message.author.id]) {
            if (!args[0]) return message.reply(language.noWaifuID);
            if (isNaN(args[0])) return message.reply(language.waifuIsNaN);
            if (client.economyManager[message.author.id].team && client.economyManager[message.author.id].team.members.length) {
                for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
                    if (client.economyManager[message.author.id].team.members[i] == args[0]) return message.reply(language.inTeam);
                }
            }
            var c = 1;
            while (c < 50) {
                c++;
                eval("var team = client.economyManager[message.author.id].team" + c);
                if (team && team.members.length) {
                    for (var i = 0; i < team.members.length; i++) {
                        if (team.members[i] == args[0]) return message.reply(language.inTeam);
                    }
                }
            }
            var waifu;
            for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                if (client.economyManager[message.author.id].waifus[i].id == args[0]) {
                    waifu = client.economyManager[message.author.id].waifus[i];
                    break;
                }
            }
            if (!waifu) return message.reply(language.invalidWaifu);
            client.divorce[message.author.id] = args[0];
            message.reply(language.deleteWarning.replace("$name", waifu.name));
        }
        else {
            switch (args[0]) {
                case "cancel": {
                    client.divorce[message.author.id] = undefined;
                    message.reply(language.deleteCancelled);
                    break;
                }
                default: {
                    var waifu;
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        if (client.economyManager[message.author.id].waifus[i].id == client.divorce[message.author.id]) {
                            waifu = client.economyManager[message.author.id].waifus[i];
                            break;
                        }
                    }
                    if (!waifu) return message.reply(language.waifuNotFound);
                    var rarityValue = 0, level = waifu.level, name = waifu.name;
                    switch (waifu.rarity) {
                        case "Normal": {rarityValue = 1; break}
                        case "Rare": {rarityValue = 1.5; break}
                        case "Super Rare": {rarityValue = 2.5; break}
                        case "Specially Super Rare": {rarityValue = 3.75; break}
                        case "Super Super Rare": {rarityValue = 4.5; break}
                        case "Ultra Rare": {rarityValue = 6; break}
                        default: {return message.reply("Cannot identify the Waifu rarity!")}
                    }
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        if (client.economyManager[message.author.id].waifus[i].id == client.divorce[message.author.id]) {
                            client.economyManager[message.author.id].waifus.splice(i, 1);
                            break;
                        }
                    }
                    client.divorce[message.author.id] = undefined;
                    var divorceValue = parseInt(500 * rarityValue * (1 + (0.075 * level)));
                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                    coins += divorceValue;
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
                                .setAuthor(message.author.username + " has just divorced a waifu and got " + divorceValue + " " + client.config.currency + ".", message.author.avatarURL({size: 128}))
                                .setTimestamp()
                            );
                            message.channel.send(new Discord.MessageEmbed()
                            .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                            .setDescription(language.divorced.replace("$name", waifu.name).replace("$amount", divorceValue.toLocaleString() + " " + client.config.currency))
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
    name: "divorce",
    description: "Delete a waifu and get a compensation amount",
    usage: require("../config.json").prefix + "divorce <waifu ID>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}