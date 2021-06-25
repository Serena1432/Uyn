const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function info(client, message, args) {
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    if (!client.economyManager[message.author.id].team) client.economyManager[message.author.id].team = {
        name: "",
        members: []
    };
    try {
        switch (args[0]) {
            case "add": {
                if (client.economyManager[message.author.id].team.members.length >= 3) return message.reply("Your team already have enough members! Please remove one using the `team remove <member id>` command and try again!");
                if (!args[1]) return message.reply("Please type a waifu ID!");
                if (isNaN(args[1])) return message.reply("The waifu ID must be a number!");
                var waifu, length = client.economyManager[message.author.id].team.members.length;
                for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                    if (client.economyManager[message.author.id].waifus[i].id == args[1]) {
                        waifu = client.economyManager[message.author.id].waifus[i];
                        break;
                    }
                }
                if (!waifu) return message.reply("Invalid waifu ID!");
                for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
                    if (client.economyManager[message.author.id].team.members[i] == waifu.id) return message.reply("This waifu/husbando is already in your team!");
                }
                client.economyManager[message.author.id].team.members.push(waifu.id);
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "update",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        message.channel.send(new Discord.MessageEmbed()
                        .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                        .setColor(Math.floor(Math.random() * 16777215))
                        .setDescription("Successfully added **" + waifu.name + "** into your team.")
                        .setTimestamp());
                    }
                    else {
                        client.economyManager[message.author.id].team.members.splice(length, 1);
                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                    }
                });
                break;
            }
            case "remove": {
                if (client.economyManager[message.author.id].team.members.length == 0) return message.reply("Your team don't have any members! Please add one using the `team add <waifu id>` command and try again!");
                if (!args[1]) return message.reply("Please type a member ID!");
                if (isNaN(args[1])) return message.reply("The member ID must be a number!");
                if (!client.economyManager[message.author.id].team.members[parseInt(args[1]) - 1]) return message.reply("Invalid member ID!");
                var waifu, length = client.economyManager[message.author.id].team.members.length;
                for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                    if (client.economyManager[message.author.id].waifus[i].id == client.economyManager[message.author.id].team.members[parseInt(args[1]) - 1]) {
                        waifu = client.economyManager[message.author.id].waifus[i];
                        break;
                    }
                }
                client.economyManager[message.author.id].team.members.splice(parseInt(args[1]) - 1, 1);
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "update",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        message.channel.send(new Discord.MessageEmbed()
                        .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                        .setColor(Math.floor(Math.random() * 16777215))
                        .setDescription("Successfully removed **" + waifu.name + "** from your team.")
                        .setTimestamp());
                    }
                    else {
                        client.economyManager[message.author.id].team.members.push(waifu.id);
                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                    }
                });
                break;
            }
            case "rename": {
                var oldName = client.economyManager[message.author.id].team.name;
                args.splice(0, 1);
                if (!args[0]) return message.reply("Please type a team name!");
                var newName = args.join(" ");
                if (oldName == newName) return message.reply("You have already set that team name!");
                client.economyManager[message.author.id].team.name = newName;
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "update",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        message.channel.send(new Discord.MessageEmbed()
                        .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                        .setColor(Math.floor(Math.random() * 16777215))
                        .setDescription("Successfully renamed your team into " + newName + ".")
                        .setTimestamp());
                    }
                    else {
                        client.economyManager[message.author.id].team.name = oldName;
                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                    }
                });
                break;
            }
            default: {
                if (client.economyManager[message.author.id].team.members.length == 0) return message.channel.send(new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setDescription("You don't have any team.\nUse the `team add <waifu id>` command to add a member to your team.")
                    .setTimestamp());
                embed = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag + "'s " + (client.economyManager[message.author.id].team.name != "" ? client.economyManager[message.author.id].team.name : "team"), message.author.avatarURL({size: 128, dynamic: true}))
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setDescription("Use the `team add <waifu id>` command to add a member to your team.\nUse the `team remove <member id>` command to add a member to your team.\nUse the `team rename <name>` command to rename your team.")
                    .setTimestamp();
                for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
                    var waifu;
                    for (var j = 0; j < client.economyManager[message.author.id].waifus.length; j++) {
                        if (client.economyManager[message.author.id].waifus[j].id == client.economyManager[message.author.id].team.members[i]) {
                            waifu = client.economyManager[message.author.id].waifus[j];
                            break;
                        }
                    }
                    embed.addField((i + 1) + ". " + waifu.name + " (" + waifu.anime + ")", "**Level:** " + waifu.level + " / **HP:** " + parseInt(waifu.base_hp * (1 + 0.05 * waifu.level)).toLocaleString() + " / **Attack:** " + parseInt(waifu.base_atk * (1 + 0.075 * waifu.level)).toLocaleString() + " / **Defense:** " + parseInt(waifu.base_def * (1 + 0.085 * waifu.level)).toLocaleString())
                }
                message.channel.send(embed);
                break;
            }
        }
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
                info(client, message, args);
                return;
            }
            else {
                client.economyManager[message.author.id] = {
                    coins: encrypt("500"),
                    waifus: [],
                    team: {
                        name: "",
                        members: []
                    }
                };
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "add",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        info(client, message, args);
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
    name: "team",
    description: "Manage your waifu team",
    usage: require("../config.json").prefix + "team: View your current team\n" + require("../config.json").prefix + "team add <id>: Add a waifu/husbando to your team\n" + require("../config.json").prefix + "team remove <id>: Remove a waifu/husbando to your team\n" + require("../config.json").prefix + "team rename <name>: Rename your team",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}