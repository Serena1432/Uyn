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

function flip(client, message, args, language) {
    if (!client.economyManager[message.author.id].coins) return message.reply(language.coinError);
    try {
        if (!client.countdown[message.author.id] || client.countdown[message.author.id] < (new Date()).getTime()) {
            if (args[0] != "heads" && args[0] != "tails") return message.reply(language.headOrTails);
            if (message.mentions.users.size && !args[1]) return message.reply(language.missingAmount);
            if (isNaN(args[1])) return message.reply(language.amountIsNaN);
            if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < parseInt(args[1])) return message.reply(language.insufficentBalance);
            client.countdown[message.author.id] = parseInt(new Date().getTime() + 15000);
            var hot = 1;
            var emojiText = "<:heads:851267941093343273>";
            if (args[0] == "tails") {
                hot = 2;
                emojiText = "<:tails:851267996231270420>";
            }
            message.channel.send(language.hotChoose.replace("$user", message.author.username).replace("$type", args[0]).replace("$amount", args[1] + " " + client.config.currency)).then(msg => {
                setTimeout(function() {
                    var hotRand = random(0, 500);
                    if (hotRand < random(150, 400)) hotRand = 1;
                    else hotRand = 2;
                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                    if (hotRand == hot) coins += parseInt(args[1]);
                    else coins -= parseInt(args[1]);
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
                            var resultText = "heads";
                            if (hotRand == 2) resultText = "tails";
                            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                            let result = "";
                            for (let i = 0; i < 32; i++) {
                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**" + language.transactionID + "** " + result, new Discord.MessageEmbed()
                                .setColor(Math.floor(Math.random() * 16777215))
                                .setAuthor(message.author.username + " has just " + ((hotRand == hot) ? "won" : "lost") + " " + args[1] + " " + client.config.currency + " because of the flip command.", message.author.avatarURL({size: 128}))
                                .setTimestamp()
                            );
                            else console.log("Cannot get the log channel.");
                            if (hotRand == hot) msg.edit(language.hotChooseWin.replace("$user", message.author.username).replace("$type", args[0]).replace("$amount", (args[1] + " " + client.config.currency)).replace("$user", message.author.username).replace("$amount", (args[1] + " " + client.config.currency)), new Discord.MessageEmbed()
                                .setColor(Math.floor(Math.random() * 16777215))
                                .setDescription(language.transactionEmbedNotice.replace("$id", result))
                                .setTimestamp()
                            );
                            else msg.edit(language.hotChooseLose.replace("$user", message.author.username).replace("$type", args[0]).replace("$amount", (args[1] + " " + client.config.currency)).replace("$type", args[0]).replace("$result", resultText).replace("$user", message.author.username).replace("$amount", (args[1] + " " + client.config.currency)), new Discord.MessageEmbed()
                                .setColor(Math.floor(Math.random() * 16777215))
                                .setDescription(language.transactionEmbedNotice.replace("$id", result))
                                .setTimestamp()
                            );
                        } else {
                            coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                            if (hotRand == hot) coins -= parseInt(args[1]);
                            else coins += parseInt(args[1]);
                            client.economyManager[message.author.id].coins = encrypt(coins.toString());
                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                            return message.reply(language.serverConnectError);
                        }
                    });
                }, 5000);
            });
        } else {
            var totalSeconds = (client.countdown[message.author.id] - (new Date()).getTime()) / 1000;
            var days = parseInt(totalSeconds / 86400);
            var hours = parseInt((totalSeconds - days * 86400) / 3600);
            var minutes = parseInt((totalSeconds - days * 86400 - hours * 3600) / 60);
            var seconds = parseInt(totalSeconds - days * 86400 - hours * 3600 - minutes * 60);
            var timeText = "";
            if (days > 0) timeText += days + "d ";
            if (hours > 0) timeText += hours + "h ";
            if (minutes > 0) timeText += minutes + "m ";
            if (seconds > 0) timeText += seconds + "s ";
            return message.reply(language.waitCountdown.replace("$time", timeText));
        }
    } catch (err) {
        console.log(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.run = async (client, message, args, language) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
            try {
                client.economyManager = JSON.parse(body);
                if (client.economyManager[message.author.id]) {
                    flip(client, message, args, language);
                    return;
                } else {
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
                            flip(client, message, args, language);
                            return;
                        }
						else {
							console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
							return message.reply(language.serverConnectError);
						}
                    });
                }
            } catch (err) {
                console.error(err);
            }
        } else return message.reply(language.serverConnectError);
    });
}

module.exports.config = {
    name: "flip",
    description: "Flip the coin",
    usage: require("../config.json").prefix + "flip heads/tails <amount>",
    accessableby: "Members",
    aliases: [],
    category: "🎲 Gambling",
    dmAvailable: true
}