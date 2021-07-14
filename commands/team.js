const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function info(client, message, args, language) {
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    if (!client.economyManager[message.author.id].team) client.economyManager[message.author.id].team = {
        name: "",
        members: []
    };
    try {
        var team = client.economyManager[message.author.id].team;
        switch (args[0]) {
            case "add": {
                if (!isNaN(args[1]) && args[1] < 50) return message.reply("The Team ID must be lower than 50!");
                if ((args[1] && args[1] == "1") || isNaN(args[1])) team = client.economyManager[message.author.id].team;
                else eval("team = client.economyManager[message.author.id].team" + args[1]);
                if (!team) eval("client.economyManager[message.author.id].team" + args[1] + " = { name : '', members: [] }; team = client.economyManager[message.author.id].team" + args[1]);
                if (team.members.length >= 3) return message.reply(language.enoughTeamMembers);
                if (!args[2]) return message.reply(language.noWaifuID);
                if (isNaN(args[2])) return message.reply(language.waifuIsNaN);
                var waifu, length = team.members.length;
                for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                    if (client.economyManager[message.author.id].waifus[i].id == args[2]) {
                        waifu = client.economyManager[message.author.id].waifus[i];
                        break;
                    }
                }
                if (!waifu) return message.reply(language.invalidWaifu);
                if (client.economyManager[message.author.id].team && client.economyManager[message.author.id].team.members.length) {
                    for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
                        if (client.economyManager[message.author.id].team.members[i] == waifu.id) return message.reply(language.inTeam);
                    }
                }
                var c = 1;
                while (c < 50) {
                    c++;
                    eval("var team2 = client.economyManager[message.author.id].team" + c);
                    if (!team2) break;
                    if (team2 && team2.members.length) {
                        for (var i = 0; i < team2.members.length; i++) {
                            if (team2.members[i] == waifu.id) return message.reply(language.inTeam);
                        }
                    }
                }
                team.members.push(waifu.id);
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
                        .setDescription(language.teamMemberAdded.replace("$name", waifu.name))
                        .setTimestamp());
                    }
                    else {
                        team.members.splice(length, 1);
                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply(language.serverConnectError);
                    }
                });
                break;
            }
            case "remove": {
                if (!isNaN(args[1]) && args[1] < 50) return message.reply("The Team ID must be lower than 50!");
                if ((args[1] && args[1] == "1") || isNaN(args[1])) team = client.economyManager[message.author.id].team;
                else eval("team = client.economyManager[message.author.id].team" + args[1]);
                if (!team) eval("client.economyManager[message.author.id].team" + args[1] + " = { name : '', members: [] }; team = client.economyManager[message.author.id].team" + args[1]);
                if (team.members.length == 0) return message.reply(language.noTeamMember);
                if (!args[2]) return message.reply(language.noMemberID);
                if (isNaN(args[2])) return message.reply(language.memberIDIsNaN);
                if (!team.members[parseInt(args[2]) - 1]) return message.reply(language.invalidMemberID);
                var waifu, length = team.members.length;
                for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                    if (client.economyManager[message.author.id].waifus[i].id == team.members[parseInt(args[2]) - 1]) {
                        waifu = client.economyManager[message.author.id].waifus[i];
                        break;
                    }
                }
                team.members.splice(parseInt(args[2]) - 1, 1);
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
                        .setDescription(language.teamMemberRemoved.replace("$name", waifu.name))
                        .setTimestamp());
                    }
                    else {
                        team.members.push(waifu.id);
                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply(language.serverConnectError);
                    }
                });
                break;
            }
            case "rename": {
                if (!isNaN(args[1]) && args[1] < 50) return message.reply("The Team ID must be lower than 50!");
                if ((args[1] && args[1] == "1") || isNaN(args[1])) team = client.economyManager[message.author.id].team;
                else eval("team = client.economyManager[message.author.id].team" + args[1]);
                if (!team) eval("client.economyManager[message.author.id].team" + args[1] + " = { name : '', members: [] }; team = client.economyManager[message.author.id].team" + args[1]);
                var oldName = team.name;
                args.splice(0, 2);
                if (!args[0]) return message.reply(language.noTeamName);
                var newName = args.join(" ");
                if (oldName == newName) return message.reply(language.teamNameAlreadySet);
                team.name = newName;
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
                        .setDescription(language.teamRenamed.replace("$name", newName))
                        .setTimestamp());
                    }
                    else {
                        team.name = oldName;
                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply(language.serverConnectError);
                    }
                });
                break;
            }
            default: {
                if (!isNaN(args[0]) && args[0] < 50) return message.reply("The Team ID must be lower than 50!");
                if (!args[0] || args[0] == "1") team = client.economyManager[message.author.id].team;
                else eval("team = client.economyManager[message.author.id].team" + args[0]);
                if (!team) eval("client.economyManager[message.author.id].team" + args[0] + " = { name : '', members: [] }; team = client.economyManager[message.author.id].team" + args[0]);
                if (team.members.length == 0) return message.channel.send(new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setDescription(language.noTeamMemberEmbed)
                    .setTimestamp());
                embed = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag + "'s " + (team.name != "" ? team.name : "team") + " (ID: " + (args[0] || "1") + ")", message.author.avatarURL({size: 128, dynamic: true}))
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setDescription(language.teamInstructions)
                    .setTimestamp();
                for (var i = 0; i < team.members.length; i++) {
                    var waifu;
                    for (var j = 0; j < client.economyManager[message.author.id].waifus.length; j++) {
                        if (client.economyManager[message.author.id].waifus[j].id == team.members[i]) {
                            waifu = client.economyManager[message.author.id].waifus[j];
                            break;
                        }
                    }
                    embed.addField((i + 1) + ". " + waifu.name + " (" + waifu.anime + ")", "**" + language.level + "** " + waifu.level + " / **HP:** " + parseInt(waifu.base_hp * (1 + 0.05 * waifu.level)).toLocaleString() + " / **" + language.atk + "** " + parseInt(waifu.base_atk * (1 + 0.075 * waifu.level)).toLocaleString() + " / **" + language.def + "** " + parseInt(waifu.base_def * (1 + 0.085 * waifu.level)).toLocaleString())
                }
                message.channel.send(embed);
                break;
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
    name: "team",
    description: "Manage your waifu team",
    usage: require("../config.json").prefix + "team <team id>: View your current team\n" + require("../config.json").prefix + "team add <team id> <waifu id>: Add a waifu/husbando to your team\n" + require("../config.json").prefix + "team remove <team id> <member id>: Remove a waifu/husbando to your team\n" + require("../config.json").prefix + "team rename <team> <name>: Rename your team",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}