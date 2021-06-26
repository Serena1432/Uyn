const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function gbuy(client, message, args, language) {
    if (!args[0]) return message.reply(language.specifyItemID);
    if (isNaN(args[0])) return message.reply(language.itemIDIsNaN);
    if (!message.guild.member(client.user).hasPermission("MANAGE_ROLES")) return message.reply(language.missingManageRolesPermission);
    if (!client.economyManager[message.guild.id] || client.economyManager[message.guild.id].roles.length == 0) return message.reply("Invalid item ID!");
    if (!client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1]) return message.reply("Invalid item ID!");
    var role = message.guild.roles.cache.get(client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].id);
    if (!role) return message.reply(language.serverRoleNotFound);
    if (message.member.roles.cache.get(role.id)) return message.reply(language.alreadyHaveServerRole);
    if (role.position >= message.guild.member(client.user).roles.highest.position) return message.reply(language.botRoleLowerPosition);
    if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].price) return message.reply(language.insufficentBalance);
    try {
        var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
        coins -= parseInt(client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].price);
        client.economyManager[message.author.id].coins = encrypt(coins.toString());
        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
            type: "update",
            token: process.env.php_server_token,
            id: message.author.id,
            data: JSON.stringify(client.economyManager[message.author.id])
        }}, function(error, response, body) {
            if (!error && response.statusCode == 200 && body.includes("Success")) {
                message.member.roles.add(role, language.serverRoleBuyReason).then(r => {
                    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    let result = "";
                    for (let i = 0; i < 32; i++) {
                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                    }
                    if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**" + language.transactionID + "** " + result, new Discord.MessageEmbed()
                        .setColor(Math.floor(Math.random() * 16777215))
                        .setAuthor(message.author.username + " has just bought \"" + role.name + "\" role for " + client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].price + " " + client.config.currency + " from the \"" + message.guild.name + "\" server shop.", message.author.avatarURL({size: 128}))
                        .setTimestamp()
                    );
                    else console.log("Cannot get the log channel.");
                    const embed = {
                        color: role.hexColor,
                        author: {
                            name: language.serverRoleBought.replace("$role", role.name),
                            icon_url: message.guild.iconURL({size: 128})
                        },
                        description: "**" + language.descriptionEmbedField + "**\n" + client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].description + "\n**" + language.transactionID + "**\n" + result + "\n" + language.transactionNotice + "",
                        timestamp: new Date()
                    };
                    message.channel.send({
                        embed: embed
                    });
                }).catch(err => {
                    console.log(err);
                    coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                    coins += parseInt(client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].price);
                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                        type: "update",
                        token: process.env.php_server_token,
                        id: message.author.id,
                        data: JSON.stringify(client.economyManager[message.author.id])
                    }}, function(error, response, body) {
                        message.reply("An error has occurred while buying the role! Please try again!");
                    });
                });
            }
            else {
                coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                coins += parseInt(client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].price);
                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                return message.reply(language.serverConnectError);
            }
        });
    }
    catch (err) {
        console.error(err);
        message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.run = async (client, message, args, language) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
            client.economyManager = JSON.parse(body);
            if (client.economyManager[message.author.id]) {
                gbuy(client, message, args, language);
                return;
            }
            else {
                client.economyManager[message.author.id] = {
                    coins: encrypt("500")
                };
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "add",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        gbuy(client, message, args, language);
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
    name: "gbuy",
    description: "Buy an item in the server's shop",
    usage: require("../config.json").prefix + "gbuy <id>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: false
}