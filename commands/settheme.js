const { profile } = require("console");
const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");
const Canvas = require("canvas");

async function settheme(client, message, args, language) {
    try {
        var theme = "dark";
        if (client.economyManager[message.author.id].theme) theme = client.economyManager[message.author.id].theme;
        if (!args[0]) return message.reply(language.missingThemeName);
        if (args[0] != "light" && args[0] != "dark") return message.reply(language.missingThemeName);
        if (args[0] == theme) return message.reply(language.themeAlreadySet.replace("$theme", args[0]));
        client.economyManager[message.author.id].theme = args[0];
        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
            type: "update",
            token: process.env.php_server_token,
            id: message.author.id,
            data: JSON.stringify(client.economyManager[message.author.id])
        }}, function(error, response, body) {
            if (!error && response.statusCode == 200 && body.includes("Success")) {
                message.channel.send(language.themeSet.replace("$theme", args[0]));
            }
            else {
                client.economyManager[message.author.id].theme = theme;
                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                return message.reply(language.serverConnectError);
            }
        });
    }
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.run = async (client, message, args, language) => {
        if (client.economyManager[message.author.id]) {
            try {
                settheme(client, message, args, language);
                return;
            }
            catch (err) {
                console.log(err);
                return message.reply(language.unexpectedErrorOccurred);
            }
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            try {
                                settheme(client, message, args, language);
                                return;
                            }
                            catch (err) {
                                console.log(err);
                                return message.reply(language.unexpectedErrorOccurred);
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
                                            settheme(client, message, args, language);
                                            return;
                                        }
                                        catch (err) {
                                            console.log(err);
                                            return message.reply(language.unexpectedErrorOccurred);
                                        }
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                });
                            }
                            catch (err) {
                                console.error(err);
                                return message.reply(language.unexpectedErrorOccurred);
                            }
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

module.exports.config = {
    name: "settheme",
    description: "Set the light/dark theme for your profile",
    usage: require("../config.json").prefix + "settheme",
    accessableby: "Members",
    aliases: [],
    category: "👥 User information",
    dmAvailable: true
}