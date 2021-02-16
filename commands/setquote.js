const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");
const Canvas = require("canvas");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args) => {
    if (args[0]) {
        if (!client.quotes[message.author.id]) {
            var text = "";
            for (var i = 0; i < args.length; i++) {
                text += args[i] + " ";
            }
            text = text.substr(0, text.length - 1);
            if (text.length <= 200) {
                request(process.env.php_server_url + 'SetQuote.php?token=' + process.env.php_server_token + '&id=' + message.author.id + "&quote=" + encodeURIComponent(text), function(err, response, body) {
                    if (!response || response.statusCode != 200 || body.includes('Connection failed')) {
                        message.channel.send("Cannot connect to the BOT server! Please try again!");
                    } else {
                        if (body && body.includes('Success')) {
                            console.log(body);
                            request(process.env.php_server_url + '/GetAllQuotes.php', function(error, response, body) {
                                console.error('error:', error); // Print the error if one occurred
                                console.log(response.statusCode);
                                if (response && response.statusCode == 200) {
                                    client.quotes = JSON.parse(body);
                                    message.reply("Updated your ping-responsing message into `" + text + "`.");
                                }
                            });

                        } else {
                            console.log(body);
                            message.reply("Update failed! Make sure that you don't type any emoji into the quote!");
                        }
                    }
                });
            } else {
                message.reply("Your quote length is higher than 200!");
            }
        } else {
            var text = "";
            for (var i = 0; i < args.length; i++) {
                text += args[i] + " ";
            }
            text = text.substr(0, text.length - 1);
            if (text.length <= 200) {
                request(process.env.php_server_url + 'SetQuote.php?token=' + process.env.php_server_token + '&id=' + message.author.id + "&quote=" + encodeURIComponent(text), function(err, response, body) {
                    if (!response || response.statusCode != 200 || body.includes('Connection failed')) {
                        message.channel.send("Không thể kết nối đến máy chủ của BOT!");
                    } else {
                        if (body && body.includes('Success')) {
                            console.log(body);
                            request(process.env.php_server_url + '/GetAllQuotes.php', function(error, response, body) {
                                console.error('error:', error); // Print the error if one occurred
                                console.log(response.statusCode);
                                if (response && response.statusCode == 200) {
                                    client.quotes = JSON.parse(body);
                                    message.reply("Updated your ping-responsing message into `" + text + "`.");
                                }
                            });
                        } else {
                            console.log(body);
                            message.reply("Update failed! Make sure that you don't type any emoji into the quote!");
                        }
                    }
                });
            } else {
                message.reply("Your quote length is higher than 200!");
            }
        }
    } else {
        message.reply("You must type the quote first!");
    }
}

module.exports.config = {
    name: "setquote",
    description: "Set your ping-responsing message",
    usage: "u!setquote (quote)",
    accessableby: "Members",
    aliases: [],
    category: "💬 Ping-responsing",
    dmAvailable: true
}