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
                            if (!args[0]) return message.reply("Please choose heads or tails!");
                            if (args[0] != "heads" && args[0] != "tails") return message.reply("Choose heads or tails, not anything else!");
                            if (message.mentions.users.size && !args[1]) return message.reply("You must type an amount!");
                            if (isNaN(args[1])) return message.reply("The amount must be a number!");
                            if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < parseInt(args[1])) return message.reply("Insufficent balance!");
                            client.countdown[message.author.id] = parseInt(new Date().getTime() + 15000);
                            var hot = 1;
                            var emojiText = "<:heads:851267941093343273>";
                            if (args[0] == "tails") {
                                hot = 2;
                                emojiText = "<:tails:851267996231270420>";
                            }
                            message.channel.send("**" + message.author.username + "** choose **" + emojiText + " " + args[0] + "** for **🪙 " + args[1] + " Uyncoins**...").then(msg => {
                                setTimeout(function() {
                                    var hotRand = random(0, 500);
                                    if (hotRand < random(150, 400)) hotRand = 1;
                                    else hotRand = 2;
                                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                    if (hotRand == hot) coins += parseInt(args[1]);
                                    else coins -= parseInt(args[1]);
                                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                        type: "update",
                                        token: process.env.php_server_token,
                                        id: message.author.id,
                                        data: JSON.stringify(client.economyManager[message.author.id])
                                    }}, function(error, response, body) {
                                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                                            var resultText = "heads";
                                            if (hotRand == 2) resultText = "tails";
                                            if (hotRand == hot) msg.edit("**" + message.author.username + "** choose **" + emojiText + " " + args[0] + "** for **🪙 " + args[1] + " Uyncoins**...\nand get **" + args[0] + "**\n**" + message.author.username + "** won **🪙 " + args[1] + " Uyncoins**!");
                                            else msg.edit("**" + message.author.username + "** choose **" + emojiText + " " + args[0] + "** for **🪙 " + args[1] + " Uyncoins**...\nand get **" + resultText + "** instead...\n**" + message.author.username + "** lost **🪙 " + args[1] + " Uyncoins**...");
                                        }
                                        else {
                                            coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                            if (hotRand == hot) coins -= parseInt(args[1]);
                                            else coins += parseInt(args[1]);
                                            client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                            return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                        }
                                    });
                                }, 5000);
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
    name: "flip",
    description: "Flip the coin",
    usage: require("../config.json").prefix + "flip heads/tails <amount>",
    accessableby: "Members",
    aliases: [],
    category: "🎲 Gambling",
    dmAvailable: true
}