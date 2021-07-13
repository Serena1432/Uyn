const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function trade(client, message, args, language) {
    if (client.divorce[message.author.id]) return message.reply(language.divorcing);
    if (client.sell[message.author.id]) return message.reply(language.selling);
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    try {
        if (!client.trades[message.author.id] && message.mentions.users.size) {
            if (message.mentions.users.first().bot) return message.reply(language.cannotTradeWithBOT);
            if (message.mentions.users.first().id == message.author.id) return message.reply(language.cannotTradeWithYourself);
            if (client.trades[message.mentions.users.first().id]) return message.reply(language.alreadyInTrade);
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
            .setAuthor(language.tradeTitle.replace("$user", message.author.username).replace("$mention", message.mentions.users.first().username), message.author.avatarURL({size: 128, dynamic: true}))
            .setDescription(language.tradeInstructions)
            .addFields(
                {name: "📦 " + language.tradeItemsTitle.replace("$user", message.author.username), value: "❎ " + language.nothingAdded, inline: true},
                {name: "📦 " + language.tradeItemsTitle.replace("$user", message.mentions.users.first().username), value: "❎ " + language.nothingAdded, inline: true}
            )
            .setColor(Math.floor(Math.random() * 16777215))
            .setTimestamp());
        }
        else if (client.trades[message.author.id]) {
            var sender = message.author;
            sender.info = client.trades[message.author.id];
            var recipent = client.users.cache.get(sender.info.recipent);
            if (!recipent) return message.reply(language.recipentNotFound);
            recipent.info = client.trades[recipent.id];
            switch (args[0]) {
                case "add": {
                    if (sender.info.completed) return message.reply(language.tradeAlreadySet);
                    if (!args[1]) return message.reply(language.noWaifuID);
                    if (isNaN(args[1])) return message.reply(language.waifuIsNaN);
                    for (var i = 0; i < sender.info.items.length; i++) {
                        if (sender.info.items[i].id == args[1]) return message.reply(language.waifuAlreadyAdded);
                    }
                    if (client.economyManager[message.author.id].team && client.economyManager[message.author.id].team.members.length) {
                        for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
                            if (client.economyManager[message.author.id].team.members[i] == args[1]) return message.reply(language.inTeam);
                        }
                    }
                    var c = 1;
                    while (1) {
                        c++;
                        eval("var team = client.economyManager[message.author.id].team" + c);
                        if (!eval("client.economyManager[message.author.id].team" + c)) break;
                        if (team && team.members.length) {
                            for (var i = 0; i < team.members.length; i++) {
                                if (team.members[i] == args[1]) return message.reply(language.inTeam);
                            }
                        }
                    }
                    var waifu;
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        if (client.economyManager[message.author.id].waifus[i].id == args[1]) {
                            waifu = client.economyManager[message.author.id].waifus[i];
                            break;
                        }
                    }
                    if (!waifu) return message.reply(language.invalidWaifu);
                    sender.info.items.push(waifu);
                    break;
                }
                case "remove": {
                    if (sender.info.completed) return message.reply(language.tradeAlreadySet);
                    if (!args[1]) return message.reply(language.noTradeID);
                    if (isNaN(args[1])) return message.reply(language.tradeIDIsNaN);
                    if (!sender.info.items[parseInt(args[1]) - 1]) return message.reply(language.invalidItemID);
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
                                        if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**" + language.transactionID + "** " + result, new Discord.MessageEmbed()
                                            .setColor(Math.floor(Math.random() * 16777215))
                                            .setAuthor(sender.tag + " has just traded some items with " + recipent.tag + ".", sender.avatarURL({size: 128}))
                                            .setTimestamp()
                                        );
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
                    break;
                }
                case "end": {
                    client.trades[sender.info.recipent] = undefined;
                    client.trades[message.author.id] = undefined;
                    return message.channel.send(new Discord.MessageEmbed()
                    .setAuthor(sender.tag, sender.avatarURL({size: 128, dynamic: true}))
                    .setDescription(language.tradeEnded.replace("$mention", recipent.tag))
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setTimestamp());
                    break;
                }
                default: {
                    return message.reply(language.invalidTradeCommand);
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
                .setAuthor((sender.info.completed && recipent.info.completed) ? language.tradeCompleted : (language.tradeTitle.replace("$user", sender.username).replace("$mention", recipent.username)), sender.avatarURL({size: 128, dynamic: true}))
                .setDescription(language.tradeInstructions)
                .addFields(
                    {name: "📦 " + language.tradeItemsTitle.replace("$user", sender.username) + (sender.info.completed ? language.tradeItemSet : ""), value: (sender.info.items.length ? sender.description : ("❎ " + language.nothingAdded)), inline: true},
                    {name: "📦 " + language.tradeItemsTitle.replace("$user", recipent.username) + (recipent.info.completed ? language.tradeItemSet : ""), value: (recipent.info.items.length ? recipent.description : ("❎ " + language.nothingAdded)), inline: true}
                )
                .setColor(Math.floor(Math.random() * 16777215))
                .setTimestamp());
                if (sender.info.completed && recipent.info.completed) {
                    client.trades[sender.info.recipent] = undefined;
                    client.trades[message.author.id] = undefined;
                }
            }
        }
        else return message.reply(language.pleaseMentionRecipent)
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
                if (message.mentions.users.size) {
                    if (client.economyManager[message.mentions.users.first().id]) {
                        trade(client, message, args, language);
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
                                trade(client, message, args, language);
                                return;
                            }
                            else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                            return message.reply(language.serverConnectError);
                        });
                    }
                }
                else trade(client, message, args, language);
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
                                trade(client, message, args, language);
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
                                        trade(client, message, args, language);
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                });
                            }
                        }
                        else trade(client, message, args, language);
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
    name: "trade",
    description: "Begin a waifu/husbando trade with someone",
    usage: require("../config.json").prefix + "trade @mention",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: false
}