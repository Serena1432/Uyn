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
                if (client.economyManager[message.author.id]) {
                    if (!args[0]) return message.reply("Please type an item ID!");
                    if (isNaN(args[0])) return message.reply("The item ID must be a number!");
                    if (!message.guild.member(client.user).hasPermission("MANAGE_ROLES")) return message.reply("I don't have the Manage Roles permission! Please contact the server admin!");
                    if (!client.economyManager[message.guild.id] || client.economyManager[message.guild.id].roles.length == 0) return message.reply("Invalid item ID!");
                    if (!client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1]) return message.reply("Invalid item ID!");
                    var role = message.guild.roles.cache.get(client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].id);
                    if (!role) return message.reply("Cannot get the role information!");
                    if (message.member.roles.cache.get(role.id)) return message.reply("You have already had that role!");
                    if (role.position >= message.guild.member(client.user).roles.highest.position) return message.reply("This role's position is higher than the BOT's highest role's!");
                    if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].price) return message.reply("Insufficent balance!");
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
                                message.member.roles.add(role, "Bought the role from the server shop").then(r => {
                                    const embed = {
                                        color: role.hexColor,
                                        author: {
                                            name: "Succesfully bought the " + role.name + " role.",
                                            icon_url: message.guild.iconURL({size: 128})
                                        },
                                        description: "**Description:**\n" + client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].description,
                                        timestamp: new Date()
                                    };
                                    message.channel.send({
                                        embed: embed
                                    });
                                });
                            }
                            else {
                                coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                coins += parseInt(client.economyManager[message.guild.id].roles[parseInt(args[0]) - 1].price);
                                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                            }
                        });
                    }
                    catch (err) {
                        console.error(err);
                        message.reply("An unexpected error occurred.");
                    }
                }
                else return message.reply("I can't get your economy information; can you try initializing/refreshing your information using the `init` command?");
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