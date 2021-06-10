const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

module.exports.run = async (client, message, args) => {
    if (!message.mentions.users.size) {
        if (client.economyManager[message.author.id]) {
            if (!client.economyManager[message.author.id].coins) return message.reply("Cannot get the coins information.");
            try {
                message.reply("You currently have **" + decrypt(client.economyManager[message.author.id].coins) + " " + client.config.currency + "**!");
            }
            catch (err) {
                console.log(err);
                return message.reply("An unexpected error occurred.");
            }
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Error")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            if (!client.economyManager[message.author.id].coins) return message.reply("Cannot get the coins information.");
                            try {
                                message.reply("You currently have **" + decrypt(client.economyManager[message.author.id].coins) + " " + client.config.currency + "**!");
                            }
                            catch (err) {
                                console.log(err);
                                return message.reply("An unexpected error occurred.");
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
                                        if (!client.economyManager[message.author.id].coins) return message.reply("Cannot get the coins information.");
                                        try {
                                            message.reply("You currently have **" + decrypt(client.economyManager[message.author.id].coins) + " " + client.config.currency + "**!");
                                        }
                                        catch (err) {
                                            console.log(err);
                                            return message.reply("An unexpected error occurred.");
                                        }
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                });
                            }
                            catch (err) {
                                console.error(err);
                                return message.reply("An unexpected error occurred.");
                            }
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
    else {
        if (client.economyManager[message.mentions.users.first().id]) {
            if (!client.economyManager[message.mentions.users.first().id].coins) return message.reply("Cannot get the coins information.");
            try {
                message.reply("**" + message.mentions.users.first().username + "** currently have **" + decrypt(client.economyManager[message.mentions.users.first().id].coins) + " " + client.config.currency + "**!");
            }
            catch (err) {
                console.log(err);
                return message.reply("An unexpected error occurred.");
            }
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Error")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.mentions.users.first().id] != undefined) {
                            if (!client.economyManager[message.mentions.users.first().id].coins) return message.reply("Cannot get the coins information.");
                            try {
                                message.reply("**" + message.mentions.users.first().username + "** currently have **" + decrypt(client.economyManager[message.mentions.users.first().id].coins) + " " + client.config.currency + "**!");
                            }
                            catch (err) {
                                console.log(err);
                                return message.reply("An unexpected error occurred.");
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
                                        if (!client.economyManager[message.mentions.users.first().id].coins) return message.reply("Cannot get the coins information.");
                                        try {
                                            message.reply("**" + message.mentions.users.first().username + "** currently have **" + decrypt(client.economyManager[message.mentions.users.first().id].coins) + " " + client.config.currency + "**!");
                                        }
                                        catch (err) {
                                            console.log(err);
                                            return message.reply("An unexpected error occurred.");
                                        }
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                });
                            }
                            catch (err) {
                                console.error(err);
                                return message.reply("An unexpected error occurred.");
                            }
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