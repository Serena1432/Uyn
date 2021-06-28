const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {
    encrypt,
    decrypt
} = require("../utils/crypto.js");

module.exports.run = async (client, message, args, language) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
            client.economyManager = JSON.parse(body);
            if (!message.mentions.users.size) return message.reply(language.pleaseMentionUser);
            if (message.mentions.users.size && !args[1]) return message.reply(language.missingAmount);
            if (isNaN(args[1])) return message.reply(language.amountIsNaN);
            if (message.mentions.users.first().id == message.author.id) return message.reply("You can't give coins to yourself!");
            if (message.mentions.users.first().bot) return message.reply("You can't give coins to a BOT!");
            if (!client.economyManager[message.author.id]) {
                try {
                    client.economyManager[message.author.id] = {
                        coins: encrypt("500")
                    };
                    request.post({
                        url: process.env.php_server_url + "/EconomyManager.php",
                        formData: {
                            type: "add",
                            token: process.env.php_server_token,
                            id: message.author.id,
                            data: JSON.stringify(client.economyManager[message.author.id])
                        }
                    }, function(error, response, body) {
                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                            if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < parseInt(args[1])) return message.reply(language.insufficentBalance);
                            if (!client.economyManager[message.mentions.users.first().id]) {
                                try {
                                    client.economyManager[message.mentions.users.first().id] = {
                                        coins: encrypt("500")
                                    };
                                    request.post({
                                        url: process.env.php_server_url + "/EconomyManager.php",
                                        formData: {
                                            type: "add",
                                            token: process.env.php_server_token,
                                            id: message.mentions.users.first().id,
                                            data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                        }
                                    }, function(error, response, body) {
                                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                                            try {
                                                var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                coins -= parseInt(args[1]);
                                                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                request.post({
                                                    url: process.env.php_server_url + "/EconomyManager.php",
                                                    formData: {
                                                        type: "update",
                                                        token: process.env.php_server_token,
                                                        id: message.author.id,
                                                        data: JSON.stringify(client.economyManager[message.author.id])
                                                    }
                                                }, function(error, response, body) {
                                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                                        coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                        coins += parseInt(args[1]);
                                                        client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                        request.post({
                                                            url: process.env.php_server_url + "/EconomyManager.php",
                                                            formData: {
                                                                type: "update",
                                                                token: process.env.php_server_token,
                                                                id: message.mentions.users.first().id,
                                                                data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                                            }
                                                        }, function(error2, response2, body2) {
                                                            if (!error2 && response2.statusCode == 200 && body2.includes("Success")) {
                                                                const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                                                                let result = "";
                                                                for (let i = 0; i < 32; i++) {
                                                                    result += characters.charAt(Math.floor(Math.random() * characters.length));
                                                                }
                                                                if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**" + language.transactionID + "** " + result, new Discord.MessageEmbed()
                                                                    .setColor(Math.floor(Math.random() * 16777215))
                                                                    .setAuthor(message.author.username + " have just sent " + args[1] + " " + client.config.currency + " to " + message.mentions.users.first().username + "!", message.author.avatarURL({size:128}))
                                                                    .setTimestamp()
                                                                );
                                                                else console.log("Cannot get the log channel.");
                                                                message.channel.send("**" + message.author.username + language.haveJustSent + args[1] + " " + client.config.currency + language.giveTo + message.mentions.users.first().username + "**!", new Discord.MessageEmbed()
                                                                    .setColor(Math.floor(Math.random() * 16777215))
                                                                    .setDescription(language.transactionEmbedNotice.replace("$id", result))
                                                                    .setTimestamp()
                                                                );
                                                            } else {
                                                                var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                                coins += parseInt(args[1]);
                                                                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                                coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                                coins -= parseInt(args[1]);
                                                                client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                                return message.reply(language.serverConnectError);
                                                            }
                                                        });
                                                    } else {
                                                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                        var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                        coins += parseInt(args[1]);
                                                        client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                        return message.reply(language.serverConnectError);
                                                    }
                                                });
                                            } catch (err) {
                                                console.error(err);
                                                return message.reply(language.unexpectedErrorOccurred);
                                            }
                                        } else {
                                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                            return message.reply(language.serverConnectError);
                                        }
                                    });
                                } catch (err) {
                                    console.error(err);
                                    return message.reply(language.unexpectedErrorOccurred);
                                }
                            } else {
                                try {
                                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                    coins -= parseInt(args[1]);
                                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                    request.post({
                                        url: process.env.php_server_url + "/EconomyManager.php",
                                        formData: {
                                            type: "update",
                                            token: process.env.php_server_token,
                                            id: message.author.id,
                                            data: JSON.stringify(client.economyManager[message.author.id])
                                        }
                                    }, function(error, response, body) {
                                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                                            coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                            coins += parseInt(args[1]);
                                            client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                            request.post({
                                                url: process.env.php_server_url + "/EconomyManager.php",
                                                formData: {
                                                    type: "update",
                                                    token: process.env.php_server_token,
                                                    id: message.mentions.users.first().id,
                                                    data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                                }
                                            }, function(error2, response2, body2) {
                                                if (!error2 && response2.statusCode == 200 && body2.includes("Success")) {
                                                    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                                                    let result = "";
                                                    for (let i = 0; i < 32; i++) {
                                                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                                                    }
                                                    if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**" + language.transactionID + "** " + result, new Discord.MessageEmbed()
                                                        .setColor(Math.floor(Math.random() * 16777215))
                                                        .setAuthor(message.author.username + " have just sent " + args[1] + " " + client.config.currency + " to " + message.mentions.users.first().username + "!", message.author.avatarURL({size:128}))
                                                        .setTimestamp()
                                                    );
                                                    else console.log("Cannot get the log channel.");
                                                    message.channel.send("**" + message.author.username + language.haveJustSent + args[1] + " " + client.config.currency + language.giveTo + message.mentions.users.first().username + "**!", new Discord.MessageEmbed()
                                                        .setColor(Math.floor(Math.random() * 16777215))
                                                        .setDescription(language.transactionEmbedNotice.replace("$id", result))
                                                        .setTimestamp()
                                                    );
                                                } else {
                                                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                    coins += parseInt(args[1]);
                                                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                    coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                    coins -= parseInt(args[1]);
                                                    client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                    return message.reply(language.serverConnectError);
                                                }
                                            });
                                        } else {
                                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                            var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                            coins += parseInt(args[1]);
                                            client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                            return message.reply(language.serverConnectError);
                                        }
                                    });
                                } catch (err) {
                                    console.error(err);
                                    return message.reply(language.unexpectedErrorOccurred);
                                }
                            }
                        } else {
                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                            return message.reply(language.serverConnectError);
                        }
                    });
                } catch (err) {
                    console.error(err);
                    return message.reply(language.unexpectedErrorOccurred);
                }
            } else {
                try {
                    if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < parseInt(args[1])) return message.reply(language.insufficentBalance);
                    if (!client.economyManager[message.mentions.users.first().id]) {
                        try {
                            client.economyManager[message.mentions.users.first().id] = {
                                coins: encrypt("500")
                            };
                            request.post({
                                url: process.env.php_server_url + "/EconomyManager.php",
                                formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: message.mentions.users.first().id,
                                    data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                }
                            }, function(error, response, body) {
                                if (!error && response.statusCode == 200 && body.includes("Success")) {
                                    try {
                                        var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                        coins -= parseInt(args[1]);
                                        client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                        request.post({
                                            url: process.env.php_server_url + "/EconomyManager.php",
                                            formData: {
                                                type: "update",
                                                token: process.env.php_server_token,
                                                id: message.author.id,
                                                data: JSON.stringify(client.economyManager[message.author.id])
                                            }
                                        }, function(error, response, body) {
                                            if (!error && response.statusCode == 200 && body.includes("Success")) {
                                                coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                coins += parseInt(args[1]);
                                                client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                request.post({
                                                    url: process.env.php_server_url + "/EconomyManager.php",
                                                    formData: {
                                                        type: "update",
                                                        token: process.env.php_server_token,
                                                        id: message.mentions.users.first().id,
                                                        data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                                    }
                                                }, function(error2, response2, body2) {
                                                    if (!error2 && response2.statusCode == 200 && body2.includes("Success")) {
                                                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                                                        let result = "";
                                                        for (let i = 0; i < 32; i++) {
                                                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                                                        }
                                                        if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**" + language.transactionID + "** " + result, new Discord.MessageEmbed()
                                                            .setColor(Math.floor(Math.random() * 16777215))
                                                            .setAuthor(message.author.username + " have just sent " + args[1] + " " + client.config.currency + " to " + message.mentions.users.first().username + "!", message.author.avatarURL({size:128}))
                                                            .setTimestamp()
                                                        );
                                                        else console.log("Cannot get the log channel.");
                                                        message.channel.send("**" + message.author.username + language.haveJustSent + args[1] + " " + client.config.currency + language.giveTo + message.mentions.users.first().username + "**!", new Discord.MessageEmbed()
                                                            .setColor(Math.floor(Math.random() * 16777215))
                                                            .setDescription(language.transactionEmbedNotice.replace("$id", result))
                                                            .setTimestamp()
                                                        );
                                                    } else {
                                                        var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                        coins += parseInt(args[1]);
                                                        client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                        coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                        coins -= parseInt(args[1]);
                                                        client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                        return message.reply(language.serverConnectError);
                                                    }
                                                });
                                            } else {
                                                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                coins += parseInt(args[1]);
                                                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                return message.reply(language.serverConnectError);
                                            }
                                        });
                                    } catch (err) {
                                        console.error(err);
                                        return message.reply(language.unexpectedErrorOccurred);
                                    }
                                } else {
                                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                }
                            });
                        } catch (err) {
                            console.error(err);
                            return message.reply(language.unexpectedErrorOccurred);
                        }
                    } else {
                        try {
                            var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                            coins -= parseInt(args[1]);
                            client.economyManager[message.author.id].coins = encrypt(coins.toString());
                            request.post({
                                url: process.env.php_server_url + "/EconomyManager.php",
                                formData: {
                                    type: "update",
                                    token: process.env.php_server_token,
                                    id: message.author.id,
                                    data: JSON.stringify(client.economyManager[message.author.id])
                                }
                            }, function(error, response, body) {
                                if (!error && response.statusCode == 200 && body.includes("Success")) {
                                    coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                    coins += parseInt(args[1]);
                                    client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                    request.post({
                                        url: process.env.php_server_url + "/EconomyManager.php",
                                        formData: {
                                            type: "update",
                                            token: process.env.php_server_token,
                                            id: message.mentions.users.first().id,
                                            data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                        }
                                    }, function(error2, response2, body2) {
                                        if (!error2 && response2.statusCode == 200 && body2.includes("Success")) {
                                            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                                            let result = "";
                                            for (let i = 0; i < 32; i++) {
                                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                                            }
                                            if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**" + language.transactionID + "** " + result, new Discord.MessageEmbed()
                                                .setColor(Math.floor(Math.random() * 16777215))
                                                .setAuthor(message.author.username + " have just sent " + args[1] + " " + client.config.currency + " to " + message.mentions.users.first().username + "!", message.author.avatarURL({size:128}))
                                                .setTimestamp()
                                            );
                                            else console.log("Cannot get the log channel.");
                                            message.channel.send("**" + message.author.username + language.haveJustSent + args[1] + " " + client.config.currency + language.giveTo + message.mentions.users.first().username + "**!", new Discord.MessageEmbed()
                                                .setColor(Math.floor(Math.random() * 16777215))
                                                .setDescription(language.transactionEmbedNotice.replace("$id", result))
                                                .setTimestamp()
                                            );
                                        } else {
                                            var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                            coins += parseInt(args[1]);
                                            client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                            coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                            coins -= parseInt(args[1]);
                                            client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                            return message.reply(language.serverConnectError);
                                        }
                                    });
                                } else {
                                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                    coins += parseInt(args[1]);
                                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                    return message.reply(language.serverConnectError);
                                }
                            });
                        } catch (err) {
                            console.error(err);
                            return message.reply(language.unexpectedErrorOccurred);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    return message.reply(language.unexpectedErrorOccurred);
                }
            }
        } else {
            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
            return message.reply(language.serverConnectError);
        }
    });
}

module.exports.config = {
    name: "give",
    description: "Give someone some Uyncoins",
    usage: require("../config.json").prefix + "give @mention amount",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}