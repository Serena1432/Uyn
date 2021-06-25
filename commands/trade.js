const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function trade(client, message, args) {
    if (client.divorce[message.author.id]) return message.reply("You are currently in a divorce, please cancel or complete it first!");
    if (client.sell[message.author.id]) return message.reply("You are currently selling a waifu, please cancel or complete it first!");
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    try {
        if (!client.trades[message.author.id] && message.mentions.users.size) {
            if (message.mentions.users.first().bot) return message.reply("You cannot trade with a BOT!");
            if (message.mentions.users.first().id == message.author.id) return message.reply("You cannot trade with a yourself!");
            if (client.trades[message.mentions.users.first().id]) return message.reply("The mentioned user is currently in a trade!");
            client.trades[message.author.id] = {
                recipent: message.mentions.users.first().id,
                items: [],
                completed: false
            };
            client.trades[message.mentions.users.first().id] = {
                recipent: message.author.id,
                items: [],
                completed: false
            };
            message.channel.send(new Discord.MessageEmbed()
            .setAuthor(message.author.username + "'s trade with " + message.mentions.users.first().username, message.author.avatarURL({size: 128, dynamic: true}))
            .setDescription("If you encountered an error during the trade, that means the BOT has been restarted.\nAt that time, please begin the trade again.\n\nUse the `trade add <waifu ID>` command to add a waifu to the trade.\nUse the `trade remove <trade item ID>` command to remove a trade item.\nUse the `trade set` to completely set your trade items.\nUse the `trade end` command to end this trade without changing anything.")
            .addFields(
                {name: "📦 " + message.author.username + "'s items", value: "❎ Nothing has been added yet.", inline: true},
                {name: "📦 " + message.mentions.users.first().username + "'s items", value: "❎ Nothing has been added yet.", inline: true}
            )
            .setColor(Math.floor(Math.random() * 16777215))
            .setTimestamp());
        }
        else if (client.trades[message.author.id]) {
            var sender = message.author;
            sender.info = client.trades[message.author.id];
            var recipent = client.users.cache.get(sender.info.recipent);
            if (!recipent) return message.reply("Cannot get the recipent information!");
            recipent.info = client.trades[recipent.id];
            switch (args[0]) {
                case "add": {
                    if (sender.info.completed) return message.reply("You have already set your trade items!");
                    if (!args[1]) return message.reply("Please type a waifu ID!");
                    if (isNaN(args[1])) return message.reply("The waifu ID must be a number!");
                    for (var i = 0; i < sender.info.items.length; i++) {
                        if (sender.info.items[i].id == args[1]) return message.reply("You have already added this waifu!");
                    }
                    if (client.economyManager[sender.id].team && client.economyManager[sender.id].team.members.length) {
                        for (var i = 0; i < client.economyManager[sender.id].team.members.length; i++) {
                            if (client.economyManager[sender.id].team.members[i] == args[1]) return message.reply("This waifu is currently in your team! Please remove his/her from your team first!");
                        }
                    }
                    var waifu;
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        if (client.economyManager[message.author.id].waifus[i].id == args[1]) {
                            waifu = client.economyManager[message.author.id].waifus[i];
                            break;
                        }
                    }
                    if (!waifu) return message.reply("Invalid waifu ID!");
                    sender.info.items.push(waifu);
                    break;
                }
                case "remove": {
                    if (sender.info.completed) return message.reply("You have already set your trade items!");
                    if (!args[1]) return message.reply("Please type the ID first!");
                    if (isNaN(args[1])) return message.reply("The ID must be a number!");
                    if (!sender.info.items[parseInt(args[1]) - 1]) return message.reply("Invalid item ID!");
                    sender.info.items.splice(parseInt(args[1]) - 1, 1);
                    break;
                }
                case "set": {
                    sender.info.completed = true;
                    if (sender.info.completed && recipent.info.completed) {
                        if (!client.economyManager[sender.id].waifus) client.economyManager[sender.id].waifus = [];
                        for (var i = 0; i < sender.info.items.length; i++) {
                            var item = sender.info.items[i];
                            for (var j = 0; j < client.economyManager[sender.id].waifus.length; j++) {
                                if (client.economyManager[sender.id].waifus[j].id == item.id) {
                                    client.economyManager[sender.id].waifus.splice(j, 1);
                                    break;
                                }
                            }
                            item.id = (client.economyManager[recipent.id].waifus[client.economyManager[recipent.id].waifus.length - 1] && client.economyManager[recipent.id].waifus[client.economyManager[recipent.id].waifus.length - 1].id) ? client.economyManager[recipent.id].waifus[client.economyManager[recipent.id].waifus.length - 1].id + 1 : 1;
                            client.economyManager[recipent.id].waifus.push(item);
                        }
                        if (!client.economyManager[recipent.id].waifus) client.economyManager[recipent.id].waifus = [];
                        for (var i = 0; i < recipent.info.items.length; i++) {
                            var item = recipent.info.items[i];
                            for (var j = 0; j < client.economyManager[recipent.id].waifus.length; j++) {
                                if (client.economyManager[recipent.id].waifus[j].id == item.id) {
                                    client.economyManager[recipent.id].waifus.splice(j, 1);
                                    break;
                                }
                            }
                            item.id = (client.economyManager[sender.id].waifus[client.economyManager[sender.id].waifus.length - 1] && client.economyManager[sender.id].waifus[client.economyManager[sender.id].waifus.length - 1].id) ? client.economyManager[sender.id].waifus[client.economyManager[sender.id].waifus.length - 1].id + 1 : 1;
                            client.economyManager[sender.id].waifus.push(item);
                        }
                        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                            type: "update",
                            token: process.env.php_server_token,
                            id: sender.id,
                            data: JSON.stringify(client.economyManager[sender.id])
                        }}, function(error, response, body) {
                            if (!error && response.statusCode == 200 && body.includes("Success")) {
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "update",
                                    token: process.env.php_server_token,
                                    id: recipent.id,
                                    data: JSON.stringify(client.economyManager[recipent.id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                                        let result = "";
                                        for (let i = 0; i < 32; i++) {
                                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                                        }
                                        if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**Transaction ID:** " + result, new Discord.MessageEmbed()
                                            .setColor(Math.floor(Math.random() * 16777215))
                                            .setAuthor(sender.tag + " has just traded some items with " + recipent.tag + ".", sender.avatarURL({size: 128}))
                                            .setTimestamp()
                                        );
                                    }
                                    else {
                                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                        return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                    }
                                });
                            }
                            else {
                                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                            }
                        });
                    }
                    break;
                }
                case "end": {
                    client.trades[sender.info.recipent] = undefined;
                    client.trades[message.author.id] = undefined;
                    return message.channel.send(new Discord.MessageEmbed()
                    .setAuthor(sender.tag, sender.avatarURL({size: 128, dynamic: true}))
                    .setDescription("Successfully ended your current trade with " + recipent.tag + ".")
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setTimestamp());
                    break;
                }
                default: {
                    return message.reply("Invalid command!");
                }
            }
            if (sender.info && recipent.info) {
                sender.description = "";
                recipent.description = "";
                for (var i = 0; i < sender.info.items.length; i++) {
                    sender.description += "**" + (i + 1) + ". " + sender.info.items[i].name + "** (Lv." + sender.info.items[i].level + ")\n";
                }
                for (var i = 0; i < recipent.info.items.length; i++) {
                    recipent.description += "**" + (i + 1) + ". " + recipent.info.items[i].name + "** (Lv." + recipent.info.items[i].level + ")\n";
                }
                message.channel.send(new Discord.MessageEmbed()
                .setAuthor((sender.info.completed && recipent.info.completed) ? "Trade completed!" : (sender.username + "'s trade with " + recipent.username), sender.avatarURL({size: 128, dynamic: true}))
                .setDescription("If you encountered an error during the trade, that means the BOT has been restarted.\nAt that time, please begin the trade again.\n\nUse the `trade add <waifu ID>` command to add a waifu to the trade.\nUse the `trade remove <trade item ID>` command to remove a trade item.\nUse the `trade set` to completely set your trade items.\nUse the `trade end` command to end this trade without changing anything.")
                .addFields(
                    {name: "📦 " + sender.username + "'s items" + (sender.info.completed ? " (Set)" : ""), value: (sender.info.items.length ? sender.description : "❎ Nothing has been added yet."), inline: true},
                    {name: "📦 " + recipent.username + "'s items" + (recipent.info.completed ? " (Set)" : ""), value: (recipent.info.items.length ? recipent.description : "❎ Nothing has been added yet."), inline: true}
                )
                .setColor(Math.floor(Math.random() * 16777215))
                .setTimestamp());
                if (sender.info.completed && recipent.info.completed) {
                    client.trades[sender.info.recipent] = undefined;
                    client.trades[message.author.id] = undefined;
                }
            }
        }
        else return message.reply("Please mention someone to begin a trade!")
    }
    catch (err) {
        console.error(err);
        return message.reply("An unexpected error occurred.");
    }
}

module.exports.run = async (client, message, args) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
            client.economyManager = JSON.parse(body);
            if (client.economyManager[message.author.id]) {
                if (message.mentions.users.size) {
                    if (client.economyManager[message.mentions.users.first().id]) {
                        trade(client, message, args);
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
                            id: message.mentions.users.first().id,
                            data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                        }}, function(error, response, body) {
                            if (!error && response.statusCode == 200 && body.includes("Success")) {
                                trade(client, message, args);
                                return;
                            }
                            else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                            return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                        });
                    }
                }
                else trade(client, message, args);
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
                        if (message.mentions.users.size) {
                            if (client.economyManager[message.mentions.users.first().id]) {
                                trade(client, message, args);
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
                                    id: message.mentions.users.first().id,
                                    data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        trade(client, message, args);
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                });
                            }
                        }
                        else trade(client, message, args);
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
    name: "trade",
    description: "Begin a waifu/husbando trade with someone",
    usage: require("../config.json").prefix + "trade @mention",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}