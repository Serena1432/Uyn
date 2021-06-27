const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function sell(client, message, args, language) {
    if (client.trades[message.author.id]) return message.reply(language.trading);
    if (client.divorce[message.author.id]) return message.reply(language.divorcing);
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    try {
        if (!client.sell[message.author.id]) {
            if (!args[0]) return message.reply(language.noWaifuID);
            if (isNaN(args[0])) return message.reply(language.waifuIsNaN);
            if (client.economyManager[message.author.id].team && client.economyManager[message.author.id].team.members.length) {
                for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
                    if (client.economyManager[message.author.id].team.members[i] == args[0]) return message.reply(language.inTeam);
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
            client.sell[message.author.id] = args[0];
            message.reply(language.sellWarning.replace("$name", waifu.name).replace("$currency", client.config.currency));
        }
        else {
            switch (args[0]) {
                case "cancel": {
                    client.sell[message.author.id] = undefined;
                    message.reply(language.sellCancelled);
                    break;
                }
                default: {
                    var waifu;
                    if (!args[0]) return message.reply(language.missingSellPrice.replace("$currency", client.config.currency));
                    if (isNaN(args[0])) return message.reply(language.priceisNaN);
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        if (client.economyManager[message.author.id].waifus[i].id == client.sell[message.author.id]) {
                            waifu = client.economyManager[message.author.id].waifus[i];
                            break;
                        }
                    }
                    if (!waifu) return message.reply(language.waifuNotFound);
                    if (!client.economyManager["6746"].waifus) client.economyManager["6746"].waifus = [];
                    var length = client.economyManager["6746"].waifus.length;
                    client.economyManager["6746"].waifus.push({
                        id: (client.economyManager["6746"].waifus[length - 1] && client.economyManager["6746"].waifus[length - 1].id) ? client.economyManager["6746"].waifus[length - 1].id + 1 : 1,
                        name: waifu.name,
                        anime: waifu.anime,
                        image_url: waifu.image_url,
                        level: waifu.level,
                        base_exp: waifu.base_exp,
                        base_atk: waifu.base_atk,
                        base_def: waifu.base_def,
                        base_hp: waifu.base_hp,
                        rarity: waifu.rarity,
                        exp: waifu.exp,
                        max_exp: waifu.max_exp,
                        price: parseInt(args[0]),
                        seller: message.author.id
                    });
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        if (client.economyManager[message.author.id].waifus[i].id == client.sell[message.author.id]) {
                            client.economyManager[message.author.id].waifus.splice(i, 1);
                            break;
                        }
                    }
                    client.sell[message.author.id] = undefined;
                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                        type: "update",
                        token: process.env.php_server_token,
                        id: message.author.id,
                        data: JSON.stringify(client.economyManager[message.author.id])
                    }}, function(error, response, body) {
                        client.countdown[message.author.id] = (new Date()).getTime() + 15000;
                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                type: "update",
                                token: process.env.php_server_token,
                                id: "6746",
                                data: JSON.stringify(client.economyManager["6746"])
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
                                        .setAuthor(message.author.username + " has just sold a waifu in the BOT's public shop.", message.author.avatarURL({size: 128}))
                                        .setTimestamp()
                                    );
                                    message.channel.send(new Discord.MessageEmbed()
                                    .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                                    .setDescription(language.sold.replace("$name", waifu.name))
                                    .setTimestamp());
                                }
                                else {
                                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                }
                            });
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
                if (client.economyManager["6746"]) {
                    sell(client, message, args, language);
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
                            sell(client, message, args, language);
                            return;
                        }
                        else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply(language.serverConnectError);
                    });
                }
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
                        if (client.economyManager["6746"]) {
                            sell(client, message, args, language);
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
                                    sell(client, message, args, language);
                                    return;
                                }
                                else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                return message.reply(language.serverConnectError);
                            });
                        }
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
    name: "sell",
    description: "Delete a waifu and get a compensation amount",
    usage: require("../config.json").prefix + "sell <waifu ID>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}