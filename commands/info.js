const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function info(client, message, args, language) {
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    try {
        if (!args[0]) return message.reply(language.noWaifuID);
        if (isNaN(args[0])) return message.reply(language.waifuIsNaN);
        var waifu;
        for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
            if (client.economyManager[message.author.id].waifus[i].id == args[0]) {
                waifu = client.economyManager[message.author.id].waifus[i];
                break;
            }
        }
        if (!waifu) return message.reply(language.invalidWaifu);
        message.channel.send(new Discord.MessageEmbed()
        .setAuthor(waifu.name + " (" + waifu.anime + ")", message.author.avatarURL({size: 128, dynamic: true}))
        .setColor(Math.floor(Math.random() * 16777215))
        .addFields(
            {name: language.rarity, value: waifu.rarity.replace("Super Super Rare", "Specially Super Rare"), inline: true},
            {name: language.level, value: waifu.level, inline: true},
            {name: language.currentEXP, value: waifu.exp + "/" + parseInt(waifu.max_exp), inline: true},
            {name: "HP:", value: parseInt(waifu.base_hp * (1 + 0.05 * waifu.level)).toLocaleString(), inline: true},
            {name: language.atk, value: parseInt(waifu.base_atk * (1 + 0.075 * waifu.level)).toLocaleString(), inline: true},
            {name: language.def, value: parseInt(waifu.base_def * (1 + 0.085 * waifu.level)).toLocaleString(), inline: true}
        )
        .setImage(waifu.image_url));
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
    name: "info",
    description: "Get the information about a waifu/husbando",
    usage: require("../config.json").prefix + "info <id>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}