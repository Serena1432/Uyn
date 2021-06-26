const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args, language) => {
    if (!message.member.hasPermission("MANAGE_GUILD") && message.author.id != client.config.ownerId[0]) return message.reply(language.needManageGuildPermission);
    if (!message.guild.member(client.user).hasPermission("MANAGE_ROLES")) return message.reply(language.missingManageRolesPermission);
    if (!client.addRole[message.author.id]) {
        request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
            if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                client.economyManager = JSON.parse(body);
                try {
                    client.addRole[message.author.id] = {
                        channel: message.channel.id
                    };
                    message.channel.send(language.beginServerRoleAdd);
                }
                catch (err) {
                    console.error(err);
                    return message.reply(language.serverConnectError);
                }
            }
            else return message.reply(language.serverConnectError);
        });
    }
    else return message.reply(language.completePreviousServerRole);
}

module.exports.config = {
    name: "addrole",
    description: "Add a role to your server's shop",
    usage: require("../config.json").prefix + "addrole",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: false
}