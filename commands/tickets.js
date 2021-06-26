const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {
    encrypt,
    decrypt
} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function inventory(client, message, args, language) {
    try {
        var embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username + "'s available tickets", message.author.avatarURL({size: 128, dynamic: true}))
        .setDescription("Use the `use <code> <waifu ID> <quantity>` command to use a leveling ticket.\nUse the `roll <code>` command to use a gacha ticket.")
        .setColor(Math.floor(Math.random() * 1677215))
        .setTimestamp();
        var items = require("../items.json");
        if (!client.economyManager[message.author.id].leveling_tickets) client.economyManager[message.author.id].leveling_tickets = {};
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.type == "leveling_ticket" || item.type == "gacha_ticket") {
                embed.addField("(" + item.code + ") " + item.name, "**Available:** " + eval("client.economyManager[message.author.id].leveling_tickets." + item.code + " ? client.economyManager[message.author.id].leveling_tickets." + item.code + ".toString() : '0'"), true);
            }
        }
        message.channel.send(embed);
    }
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.run = async (client, message, args, language) => {
    try {
        if (client.economyManager[message.author.id]) {
            inventory(client, message, args, language);
            return;
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            inventory(client, message, args, language);
                            return;
                        }
                        else {
                                client.economyManager[message.author.id] = {
                                    coins: encrypt("500"),
                                    inventory: []
                                };
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: message.author.id,
                                    data: JSON.stringify(client.economyManager[message.author.id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        inventory(client, message, args, language);
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                });
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
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.config = {
    name: "tickets",
    description: "List of your available tickets",
    usage: require("../config.json").prefix + "tickets <page>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}