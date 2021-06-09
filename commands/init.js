const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

module.exports.run = async (client, message, args) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Error")) {
            try {
                client.economyManager = JSON.parse(body);
                if (client.economyManager[message.author.id] != undefined) return message.reply("I have successfully refreshed your economy information!");
                else {
                    try {
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
                                return message.channel.send("I have successfully created " + message.author.toString() + "'s economy information!");
                            }
                            else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                            return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                        });
                    }
                    catch (err) {
                        console.error(err);
                        return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                    }
                }
            }
            catch (err) {
                console.error(err);
            }
        }
        else return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
    });
}

module.exports.config = {
    name: "init",
    description: "Initialize your Economy information",
    usage: require("../config.json").prefix + "init",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}