const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    message.delete({
        timeout: 10000
    });
    var dated = new Date();
    message.channel.send("", {embed: {
        color: Math.floor(Math.random() * 16777214) + 1,
        description: "Connecting to the BOT server, please wait..."
    }}).then(msg => {
        var serverPingText = "Unknown";
        request(process.env.php_server_url + "/GetAllQuotes.php", function(error, response, body) {
            if (!error && response.statusCode == 200) {
                serverPingText = ((new Date()).getTime() - message.createdTimestamp).toString() + "ms";
            }
            else {
                serverPingText = "Unable to connect";
            }
            msg.edit("", {embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: "Pong!"
                },
                description: "🤖 " + (dated.getTime() - message.createdTimestamp).toString() + "ms\n🖥️ " + serverPingText
            }});
        });
    });
}

module.exports.config = {
    name: "ping",
    description: "Test the BOT's Response Time",
    usage: require("../config.json").prefix + "ping",
    accessableby: "Members",
    aliases: [],
    category: "🤖 BOT information",
    dmAvailable: true
}