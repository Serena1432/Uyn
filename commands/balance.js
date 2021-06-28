const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function bal(client, message, args, language, user) {
    message.channel.send(new Discord.MessageEmbed()
    .setColor(Math.floor(Math.random() * 16777215))
    .setAuthor(language.balance.replace("$user", user.username), user.avatarURL({size:128}))
    .addFields([
        {name: client.config.currency + ":", value: parseInt(decrypt(client.economyManager[user.id].coins)).toLocaleString()},
        {name: "💬 " + language.messagePoints + ":", value: (client.economyManager[user.id].messagePoints) ? parseInt(decrypt(client.economyManager[user.id].messagePoints)).toLocaleString() : "0"}
    ])
    .setTimestamp()
    .setFooter(client.devUsername, client.user.avatarURL({size:128})));
}

module.exports.run = async (client, message, args, language) => {
    if (!message.mentions.users.size) {
        if (client.economyManager[message.author.id]) {
            if (!client.economyManager[message.author.id].coins) return message.reply(language.coinError);
            try {
                bal(client, message, args, language, message.author);
                return;
            }
            catch (err) {
                console.log(err);
                return message.reply(language.unexpectedErrorOccurred);
            }
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            if (!client.economyManager[message.author.id].coins) return message.reply(language.coinError);
                            try {
                                bal(client, message, args, language, message.author);
                                return;
                            }
                            catch (err) {
                                console.log(err);
                                return message.reply(language.unexpectedErrorOccurred);
                            }
                        }
                        else {
                            try {
                                client.economyManager[message.author.id] = {
                                    coins: encrypt("500")
                                };
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: message.author.id,
                                    data: JSON.stringify(client.economyManager[message.author.id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        if (!client.economyManager[message.author.id].coins) return message.reply(language.coinError);
                                        try {
                                            bal(client, message, args, language, message.author);
                                            return;
                                        }
                                        catch (err) {
                                            console.log(err);
                                            return message.reply(language.unexpectedErrorOccurred);
                                        }
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                });
                            }
                            catch (err) {
                                console.error(err);
                                return message.reply(language.unexpectedErrorOccurred);
                            }
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
    else {
        if (client.economyManager[message.mentions.users.first().id]) {
            if (!client.economyManager[message.mentions.users.first().id].coins) return message.reply(language.coinError);
            try {
                bal(client, message, args, language, message.mentions.users.first());
                return;
            }
            catch (err) {
                console.log(err);
                return message.reply(language.unexpectedErrorOccurred);
            }
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.mentions.users.first().id] != undefined) {
                            if (!client.economyManager[message.mentions.users.first().id].coins) return message.reply(language.coinError);
                            try {
                                bal(client, message, args, language, message.mentions.users.first());
                                return;
                            }
                            catch (err) {
                                console.log(err);
                                return message.reply(language.unexpectedErrorOccurred);
                            }
                        }
                        else {
                            try {
                                client.economyManager[message.mentions.users.first().id] = {
                                    coins: encrypt("500")
                                };
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: message.mentions.users.first().id,
                                    data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        if (!client.economyManager[message.mentions.users.first().id].coins) return message.reply(language.coinError);
                                        try {
                                            bal(client, message, args, language, message.mentions.users.first());
                                            return;
                                        }
                                        catch (err) {
                                            console.log(err);
                                            return message.reply(language.unexpectedErrorOccurred);
                                        }
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                });
                            }
                            catch (err) {
                                console.error(err);
                                return message.reply(language.unexpectedErrorOccurred);
                            }
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
}

module.exports.config = {
    name: "balance",
    description: "View your current balance",
    usage: require("../config.json").prefix + "balance",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}