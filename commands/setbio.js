const { profile } = require("console");
const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");
const Canvas = require("canvas");

async function setbio(client, message, args) {
    try {
        var bio = "";
        if (client.economyManager[message.author.id].bio) bio = client.economyManager[message.author.id].bio;
        if (!args[0]) return message.reply("Please type your biography!");
        if (args.join(" ") == bio) return message.reply("You have already set this biography for your profile!");
        if (args.join(" ").length > 1024) return message.reply("Your biography must have shorter than 1024 characters!");
        client.economyManager[message.author.id].bio = args.join(" ");
        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
            type: "update",
            token: process.env.php_server_token,
            id: message.author.id,
            data: JSON.stringify(client.economyManager[message.author.id])
        }}, function(error, response, body) {
            if (!error && response.statusCode == 200 && body.includes("Success")) {
                message.channel.send(new Discord.MessageEmbed()
                .setColor(Math.floor(Math.random() * 16777215))
                .setAuthor("Successfully updated your profile biography.", message.author.avatarURL({size:128}))
                .addField("Your current biography:", args.join(" "))
                .setTimestamp()
                .setFooter(client.devUsername, client.user.avatarURL({size:128})));
            }
            else {
                client.economyManager[message.author.id].bio = bio;
                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
            }
        });
    }
    catch (err) {
        console.error(err);
        return message.reply("An unexpected error occurred.");
    }
}

module.exports.run = async (client, message, args) => {
        if (client.economyManager[message.author.id]) {
            try {
                setbio(client, message, args);
                return;
            }
            catch (err) {
                console.log(err);
                return message.reply("An unexpected error occurred.");
            }
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Error")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            try {
                                setbio(client, message, args);
                                return;
                            }
                            catch (err) {
                                console.log(err);
                                return message.reply("An unexpected error occurred.");
                            }
                        }
                        else {
                            try {
                                client.economyManager[message.author.id] = {
                                    coins: encrypt("500"),
                                    background: "background_default",
                                    theme: "dark",
                                    bio: ""
                                };
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: message.author.id,
                                    data: JSON.stringify(client.economyManager[message.author.id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        try {
                                            setbio(client, message, args);
                                            return;
                                        }
                                        catch (err) {
                                            console.log(err);
                                            return message.reply("An unexpected error occurred.");
                                        }
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                });
                            }
                            catch (err) {
                                console.error(err);
                                return message.reply("An unexpected error occurred.");
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                        return message.reply("An unexpected error occurred.");
                    }
                }
                else return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
            });
        }
}

module.exports.config = {
    name: "setbio",
    description: "Set the bio for your profile",
    usage: require("../config.json").prefix + "setbio",
    accessableby: "Members",
    aliases: [],
    category: "👥 User information",
    dmAvailable: true
}