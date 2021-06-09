const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args) => {
        request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
            if (!error && response.statusCode == 200 && !body.includes("Error")) {
                client.economyManager = JSON.parse(body);
                if (!client.economyManager[message.guild.id] || client.economyManager[message.guild.id].roles.length == 0) return message.reply("Your server doesn't have anything in the shop!");
                var n = 0;
                if (args[0]) n = parseInt(args[0]) - 1;
                var descText = "";
                if (n * 3 > client.economyManager[message.guild.id].roles.length - 1) return message.reply("There aren't any more items in the server shop!");
                for (var i = n * 3; i < n * 3 + 3; i++) {
                    if (client.economyManager[message.guild.id].roles[i]) {
                        var role = message.guild.roles.cache.get(client.economyManager[message.guild.id].roles[i].id);
                        if (role) {
                            descText += "**" + (i + 1) + ". \"" + role.name + "\" role**\n**Description:**\n" + client.economyManager[message.guild.id].roles[i].description + "\n**Price:** " + client.economyManager[message.guild.id].roles[i].price.toString() + " " + client.config.currency + "\nUse the `gbuy " + (i + 1) + "` command to buy this item.\n\n";
                        }
                    }
                    else break;
                }
                if ((n + 1) * 3 <= client.economyManager[message.guild.id].roles.length - 1) descText += "Use the `gshop " + (n + 2) + "` command to get to the next page.";
                const embed = {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    author: {
                        name: "List of the items in the " + message.guild.name + " server",
                        icon_url: message.guild.iconURL({size: 128})
                    },
                    description: descText,
                    timestamp: new Date()
                };
                message.channel.send({
                    embed: embed
                });
            }
            else return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
        });
}

module.exports.config = {
    name: "gshop",
    description: "Open your server's shop",
    usage: require("../config.json").prefix + "gshop <page>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: false
}