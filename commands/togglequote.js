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

module.exports.run = async (client, message, args, language) => {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.reply("You do not have the `Manage Guild` permission to do this!");
    var enabled = 0;
    if (args[0] == "on") enabled = 1;
    else if (args[0] != "on" && args[0] != "off") return message.reply("Invalid value!\nYou need to type `on` or `off`!");
        request(process.env.php_server_url + '/ToggleQuote.php?token=' + process.env.php_server_token + '&type=set&server=' + message.guild.id + "&enabled=" + enabled, function(err, response, body) {
            if (!response || response.statusCode != 200 || body.includes('Connection failed')) {
                console.error(err);
                console.error(body);
                message.channel.send("Cannot connect to the BOT server! Please try again!");
            } else {
                request(process.env.php_server_url + '/ToggleQuote.php?token=' + process.env.php_server_token + '&type=get', function(error, response, body) {
                    if (response && !body.includes("Connection failed")) {
                        client.toggleQuote = JSON.parse(body);
                        console.log("👌 Ping-responsing toggle mode successfully updated");
                        if (enabled) message.reply("Successfully enabled sending ping-responsing message.");
                        else message.reply("Successfully disabled sending ping-responsing message.");
                    } else {
                        client.users.cache.get(client.config.ownerId).send("Ping-responsing toggle mode failed to update.");
                        message.reply("Changing failed! Please try again later!");
                    }
                });
            }
        });
}

module.exports.config = {
    name: "togglequote",
    description: "Enable the ping-responsing messages in this server",
    usage: require("../config.json").prefix + "togglequote (on/off)",
    accessableby: "Members",
    aliases: [],
    category: "💬 Ping-responsing",
    dmAvailable: false
}