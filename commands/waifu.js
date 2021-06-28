const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function waifu(client, message, args, language) {
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    if (!args[0] || !isNaN(args[0])) {
        if (client.economyManager[message.author.id].waifus.length == 0) return message.channel.send(new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
        .setColor(Math.floor(Math.random() * 16777215))
        .setDescription(language.noWaifuEmbed)
        .setTimestamp());
        try {
            var n = 0;
            if (args[0]) n = parseInt(args[0]) - 1;
            var descText = "**" + language.waifuCount + "** " + client.economyManager[message.author.id].waifus.length + "/200\n`--------------------------------------------------------\n| ID    ";
			if (language.waifuName.length <= 29) {
				descText += " | " + language.waifuName;
				for (var j = 0; j < 29 - language.waifuName.length; j++) descText += " ";
			}
			else descText += " | " + language.waifuName.substr(0, 26) + "...";
			if (language.level.substr(0, language.level.length - 1).length <= 11) {
				descText += " | " + language.level.substr(0, language.level.length - 1);
				for (var j = 0; j < 11 - language.level.substr(0, language.level.length - 1).length; j++) descText += " ";
			}
			else descText += " | " + language.level.substr(0, language.level.length - 1).substr(0, 8) + "...";
			descText += " |\n--------------------------------------------------------";
            if (n * 10 > client.economyManager[message.author.id].waifus.length - 1) return message.reply(language.noMoreWaifus);
            for (var i = n * 10; i < n * 10 + 10; i++) {
                if (client.economyManager[message.author.id].waifus[i]) {
                    var waifu = client.economyManager[message.author.id].waifus[i];
                    var name = "[" + waifu.rarity.replace("Super Super Rare", "Specially Super Rare") + "] " + waifu.name + " (" + waifu.anime + ")";
                    descText += "\n| " + waifu.id.toString();
                    for (var k = 0; k < 6 - waifu.id.toString().length; k++) descText += " ";
                    if (name.length <= 29) {
                        descText += " | " + name;
                        for (var k = 0; k < 29 - name.length; k++) descText += " ";
                    }
                    else descText += " | " + name.substr(0, 26) + "...";
                    var level = waifu.level + " (" + waifu.exp + "/" + parseInt(waifu.max_exp) + ")";
                    if (level.length <= 11) {
                        descText += " | " + level;
                        for (var k = 0; k < 11 - level.length; k++) descText += " ";
                    }
                    else descText += " | " + level.substr(0, 8) + "...";
                    descText += " |\n--------------------------------------------------------";
                } else break;
            }
            descText += language.waifuInstructions;
            if ((n + 1) * 10 <= client.economyManager[message.author.id].waifus.length - 1) descText += language.waifuNextPage.replace("$page", n + 2);
            const embed = {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: language.waifuTitle.replace("$user", message.author.username),
                    icon_url: message.author.avatarURL({
                        size: 128
                    })
                },
                description: descText,
                timestamp: new Date()
            };
            message.channel.send({
                embed: embed
            });
        }
        catch (err) {
            console.error(err);
            return message.reply(language.unexpectedErrorOccurred);
        }
    }
    else {
        try {
            var length = 0;
            var descText = "**" + language.waifuCount + "** " + client.economyManager[message.author.id].waifus.length + "/200\n`--------------------------------------------------------\n| ID     | ";
			if (language.waifuName.length <= 29) {
				descText += " | " + language.waifuName;
				for (var j = 0; j < 29 - language.waifuName.length; j++) descText += " ";
			}
			else descText += " | " + language.waifuName.substr(0, 26) + "...";
			if (language.level.substr(0, language.level.length - 1).length <= 11) {
				descText += " | " + language.level.substr(0, language.level.length - 1);
				for (var j = 0; j < 11 - language.level.substr(0, language.level.length - 1).length; j++) descText += " ";
			}
			else descText += " | " + language.level.substr(0, language.level.length - 1).substr(0, 8) + "...";
			descText += " |\n--------------------------------------------------------";
            for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                if ((client.economyManager[message.author.id].waifus[i].name.toLowerCase().includes(args.join(" ").toLowerCase()) || client.economyManager[message.author.id].waifus[i].anime.toLowerCase().includes(args.join(" ").toLowerCase())) && length < 15) {
                    length++;
                    var waifu = client.economyManager[message.author.id].waifus[i];
                    var name = "[" + waifu.rarity.replace("Super Super Rare", "Specially Super Rare") + "] " + waifu.name + " (" + waifu.anime + ")";
                    descText += "\n| " + waifu.id.toString();
                    for (var k = 0; k < 6 - waifu.id.toString().length; k++) descText += " ";
                    if (name.length <= 29) {
                        descText += " | " + name;
                        for (var k = 0; k < 29 - name.length; k++) descText += " ";
                    }
                    else descText += " | " + name.substr(0, 26) + "...";
                    var level = waifu.level + " (" + waifu.exp + "/" + parseInt(waifu.max_exp) + ")";
                    if (level.length <= 11) {
                        descText += " | " + level;
                        for (var k = 0; k < 11 - level.length; k++) descText += " ";
                    }
                    else descText += " | " + level.substr(0, 8) + "...";
                    descText += " |\n--------------------------------------------------------";
                }
            }
            descText += language.waifuSearchInstructions;
            const embed = {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: language.waifuSearchTitle.replace("$user", message.author.username).replace("$name", args.join(" ")),
                    icon_url: message.author.avatarURL({
                        size: 128
                    })
                },
                description: descText,
                timestamp: new Date()
            };
            message.channel.send({
                embed: embed
            });
        }
        catch (err) {
            console.error(err);
            return message.reply(language.unexpectedErrorOccurred);
        }
    }
}

module.exports.run = async (client, message, args, language) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
            client.economyManager = JSON.parse(body);
            if (client.economyManager[message.author.id]) {
                waifu(client, message, args, language);
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
                        waifu(client, message, args, language);
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
    name: "waifu",
    description: "Get your owned waifus",
    usage: require("../config.json").prefix + "waifu",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}
