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

function slots(client, message, args) {
    if (!client.economyManager[message.author.id].coins) return message.reply("Cannot get the coins information.");
    try {
        if (!client.countdown[message.author.id] || client.countdown[message.author.id] < (new Date()).getTime()) {
            if (message.mentions.users.size && !args[0]) return message.reply("You must type an amount!");
            if (isNaN(args[0])) return message.reply("The amount must be a number!");
            if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < parseInt(args[0])) return message.reply("Insufficent balance!");
            var slots = ["🍒", "🍆", "🍊", "🔔", "🥑", "7️⃣"];
            var slots1, slots2, slots3, slotsi1, slotsi2, slotsi3;
            client.countdown[message.author.id] = parseInt(new Date().getTime() + 15000);
            message.channel.send("🇽|🇽|🇽| **" + message.author.username + "** bets **" + args[0] + " " + client.config.currency + "**...").then(msg => {
                setTimeout(function() {
                    slotsi1 = random(0, slots.length - 1);
                    slots1 = slots[slotsi1];
                    msg.edit(slots1 + "|🇽|🇽| **" + message.author.username + "** bets **" + args[0] + " " + client.config.currency + "**...");
                    setTimeout(function() {
                        slotsi2 = random(0, slots.length - 1);
                        slots2 = slots[slotsi2];
                        msg.edit(slots1 + "|" + slots2 + "|🇽| **" + message.author.username + "** bets **" + args[0] + " " + client.config.currency + "**...");
                        setTimeout(function() {
                            slotsi3 = random(0, slots.length - 1);
                            slots3 = slots[slotsi3];
                            msg.edit(slots1 + "|" + slots2 + "|" + slots3 + "| **" + message.author.username + "** bets **" + args[0] + " " + client.config.currency + "**...");
                            var resultText = "",
                                coinValue, res = 1;
                            var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                            if (slotsi1 == 5 && slotsi2 == 5 && slotsi3 == 5) {
                                coinValue = parseInt(args[0]) * 10;
                                resultText = "and won **" + coinValue + " " + client.config.currency + "**!";
                            } else if (slotsi1 == slotsi2 && slotsi2 == slotsi3) {
                                coinValue = parseInt(args[0]) * random(1, 7);
                                resultText = "and won **" + coinValue + " " + client.config.currency + "**!";
                            } else {
                                coinValue = 0 - parseInt(args[0]);
                                resultText = "and lost it all...";
                                res = 0;
                            }
                            coins += coinValue;
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
                                    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                                    let result = "";
                                    for (let i = 0; i < 32; i++) {
                                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                                    }
                                    if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**Transaction ID:** " + result, new Discord.MessageEmbed()
                                        .setColor(Math.floor(Math.random() * 16777215))
                                        .setAuthor(message.author.username + " has just " + ((res == 1) ? "won" : "lost") + " " + Math.abs(coinValue) + " " + client.config.currency + " because of the slots command.", message.author.avatarURL({size: 128}))
                                        .setTimestamp()
                                    );
                                    else console.log("Cannot get the log channel.");
                                    msg.edit(slots1 + "|" + slots2 + "|" + slots3 + "| **" + message.author.username + "** bets **" + args[0] + "" + client.config.currency + "**...\n" + resultText, new Discord.MessageEmbed()
                                        .setColor(Math.floor(Math.random() * 16777215))
                                        .setDescription("The Transaction ID is " + result + ".\nYou should remember this ID and send it to the BOT developer if something wrong happened.")
                                        .setTimestamp()
                                    );
                                } else {
                                    coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                    coins -= coinValue;
                                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                }
                            });
                        }, 2000);
                    }, 2000);
                }, 2000);
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
            return message.reply("You have to wait **" + timeText + "**to do this again!");
        }
    } catch (err) {
        console.log(err);
        return message.reply("An unexpected error occurred.");
    }
}

module.exports.run = async (client, message, args) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
            try {
                client.economyManager = JSON.parse(body);
                if (client.economyManager[message.author.id]) {
                    slots(client, message, args);
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
                            slots(client, message, args);
                            return;
                        } else {
                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                            return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                        }
                    });
                }
            } catch (err) {
                console.error(err);
            }
        } else return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
    });
}

module.exports.config = {
    name: "slots",
    description: "Bet your money into the slot machine!",
    usage: require("../config.json").prefix + "slots <amount>",
    accessableby: "Members",
    aliases: [],
    category: "🎲 Gambling",
    dmAvailable: true
}