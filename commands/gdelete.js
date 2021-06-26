const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args, language) => {
    try {
        if (!message.member.hasPermission("MANAGE_GUILD") && message.author.id != client.config.ownerId[0]) return message.reply("You need the Manage Guild permission to do this!");
        request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
            if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                var formerRoles = client.economyManager[message.guild.id].roles;
                client.economyManager = JSON.parse(body);
                if (!client.economyManager[message.guild.id] || client.economyManager[message.guild.id].roles.length == 0) return message.reply("There aren't any items in the server shop!");
                if (!client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1]) return message.reply("Invalid item ID!");
                var role = message.guild.roles.cache.get(client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].id);
                client.economyManager[message.guild.id].roles.splice(parseInt(args[0]) - 1, 1);
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "update",
                    token: process.env.php_server_token,
                    id: message.guild.id,
                    data: JSON.stringify(client.economyManager[message.guild.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        const exampleEmbed = new Discord.MessageEmbed()
                        .setColor(Math.floor(Math.random() * 16777215))
                        .setAuthor('Successfully deleted the ' + ((role) ? role.name : "unknown") + ' role from the server shop.', message.guild.iconURL({size: 128}))
                        .setTimestamp()
                        .setFooter(client.devUsername, client.user.avatarURL({size: 128}));
                        message.channel.send(exampleEmbed);
                    }
                    else {
                        client.economyManager[message.author.id].roles = formerRoles;
                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply(language.serverConnectError);
                    }
                });
            }
            else return message.reply(language.serverConnectError);
        });
    }
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.config = {
    name: "gdelete",
    description: "Delete an item in the server shop",
    usage: require("../config.json").prefix + "gdeltete <id>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: false
}