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
            try {
                client.economyManager = JSON.parse(body);
                if (client.economyManager[message.author.id]) {
                    if (!client.economyManager[message.author.id].coins) return message.reply("Cannot get the coins information.");
                    try {
                        if (!client.countdown[message.author.id] || client.countdown[message.author.id] < (new Date()).getTime()) {
                            if (message.mentions.users.size && !args[0]) return message.reply("You must type an amount!");
                            if (isNaN(args[0])) return message.reply("The amount must be a number!");
                            if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < parseInt(args[0])) return message.reply("Insufficent balance!");
                            var slots = ["🍒", "🍆", "🍊", "🔔", "🥑", "7️⃣"];
                            var slots1, slots2, slots3, slotsi1, slotsi2, slotsi3;
                            client.countdown[message.author.id] = parseInt(new Date().getTime() + 15000);
                            message.channel.send("🇽|🇽|🇽| **" + message.author.username + "** bets **" + args[0] + " 🪙 Uyncoins**...").then(msg => {
                                setTimeout(function() {
                                    slotsi1 = random(0, slots.length - 1);
                                    slots1 = slots[slotsi1];
                                    msg.edit(slots1 + "|🇽|🇽| **" + message.author.username + "** bets **" + args[0] + " 🪙 Uyncoins**...");
                                    setTimeout(function() {
                                        slotsi2 = random(0, slots.length - 1);
                                        slots2 = slots[slotsi2];
                                        msg.edit(slots1 + "|" + slots2 + "|🇽| **" + message.author.username + "** bets **" + args[0] + " 🪙 Uyncoins**...");
                                        setTimeout(function() {
                                            slotsi3 = random(0, slots.length - 1);
                                            slots3 = slots[slotsi3];
                                            msg.edit(slots1 + "|" + slots2 + "|" + slots3 + "| **" + message.author.username + "** bets **" + args[0] + " 🪙 Uyncoins**...");
                                            var resultText = "", coinValue;
                                            var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                            if (slotsi1 == 5 && slotsi2 == 5 && slotsi3 == 5) {
                                                coins += parseInt(args[0]) * 10;
                                                resultText = "and won **" + coinValue + " 🪙 Uyncoins**!";
                                            }
                                            else if (slotsi1 == slotsi2 && slotsi2 == slotsi3) {
                                                coins += parseInt(args[0]) * random(1, 7);
                                                resultText = "and won **" + coinValue + " 🪙 Uyncoins**!";
                                            }
                                            else {
                                                coins -= parseInt(args[0]);
                                                resultText = "and lost it all...";
                                            }
                                            client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                                type: "update",
                                                token: process.env.php_server_token,
                                                id: message.author.id,
                                                data: JSON.stringify(client.economyManager[message.author.id])
                                            }}, function(error, response, body) {
                                                if (!error && response.statusCode == 200 && body.includes("Success")) {
                                                    msg.edit(slots1 + "|" + slots2 + "|" + slots3 + "| **" + message.author.username + "** bets **" + args[0] + "🪙 Uyncoins**...\n" + resultText);
                                                }
                                                else {
                                                    coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                    if (slotsi1 == 5 && slotsi2 == 5 && slotsi3 == 5) {
														coins -= parseInt(args[0]) * 10;
													}
													else if (slotsi1 == slotsi2 && slotsi2 == slotsi3) {
														coins -= parseInt(args[0]) * random(1, 7);
													}
													else {
														coins += parseInt(args[0]);
													}
                                                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                                }
                                            });
                                        }, 2000);
                                    }, 2000);
                                }, 2000);
                            });
                        }
                        else {
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
                    }
                    catch (err) {
                        console.log(err);
                        return message.reply("An unexpected error occurred.");
                    }
                }
                else return message.reply("I can't get your economy information; can you try initializing/refreshing your information using the `init` command?");
            }
            catch (err) {
                console.error(err);
            }
        }
        else return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
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