const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");

module.exports.run = async (client, message, args) => {
    message.delete({
        timeout: 10000
    });
    message.channel.send("", {embed: {
        color: Math.floor(Math.random() * 16777214) + 1,
        description: "Connecting to the BOT server, please wait..."
    }}).then(msg => {
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        var svStatus = "Unknown";
        var quoteInfo = "";
        try {
            const usage = require("usage");
            usage.lookup(process.pid, function(err, result) {
                if (err) {
                    console.error(err);
                    return message.reply("An error has occurred.");
                }
                request(process.env.php_server_url + '/GetAllQuotes.php', function(error, response, body) {
                    if (response && response.statusCode == 200) {
                        if (!body.includes("Connection failed")) {
                            svStatus = "Operational";
                        } else {
                            svStatus = "Cannot connect to the SQL server";
                        }
                    } else {
                        svStatus = "Cannot connect to the PHP server!";
                    }
                    var dated = new Date();
                    const mess = {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: 'BOT\'s current status',
                        description: "⏰ **BOT's restart time**: " + client.startTime.getDate() + "/" + (client.startTime.getMonth() + 1) + "/" + client.startTime.getFullYear() + "; " + client.startTime.getHours() + ":" + client.startTime.getMinutes() + "\n⬆️ **Active time:** " + days + "days, " + hours + "hours, " + minutes + "mins, " + parseInt(seconds) + "secs\n🙂 **Server response:** " + (dated.getTime() - message.createdTimestamp) + " ms\n🖥️ **Server status:** " + svStatus + "\n" + quoteInfo + "🚩 **Joined servers:** " + client.guilds.cache.size + "\n👪 **Number of users:** " + client.users.cache.size + "\n#️⃣ **Channels:** " + client.channels.cache.size + "\n💬 **Number of messages sent (from BOT's last restart):** " + client.sentMessages + "\n🤖 **Number of commands executed (from BOT's last restart):** " + client.botMessages + "\n💭 **Total RAM Usage:** " + (result.memory / 1048576).toFixed(2) + " MB\n🤖 **Total CPU Usage:** " + result.cpu.toFixed(2) + "%",
                        footer: {
                            text: client.devUsername
                        },
                    };
                    msg.edit({
                        embed: mess
                    });
                });
            });
        }
        catch (err) {
            console.log("Cannot find the usage module. Skipping...");
            request(process.env.php_server_url + '/GetAllQuotes.php', function(error, response, body) {
                if (response && response.statusCode == 200) {
                    if (!body.includes("Connection failed")) {
                        svStatus = "Operational";
                    } else {
                        svStatus = "Cannot connect to the SQL server";
                    }
                } else {
                    svStatus = "Cannot connect to the PHP server!";
                }
                var dated = new Date();
                const mess = {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'BOT\'s current status',
                    description: "⏰ **BOT's restart time**: " + client.startTime.getDate() + "/" + (client.startTime.getMonth() + 1) + "/" + client.startTime.getFullYear() + "; " + client.startTime.getHours() + ":" + client.startTime.getMinutes() + "\n⬆️ **Active time:** " + days + "days, " + hours + "hours, " + minutes + "mins, " + parseInt(seconds) + "secs\n🙂 **Server response:** " + (dated.getTime() - message.createdTimestamp) + " ms\n🖥️ **Server status:** " + svStatus + "\n" + quoteInfo + "🚩 **Joined servers:** " + client.guilds.cache.size + "\n👪 **Number of users:** " + client.users.cache.size + "\n#️⃣ **Channels:** " + client.channels.cache.size + "\n💬 **Number of messages sent (from BOT's last restart):** " + client.sentMessages + "\n🤖 **Number of commands executed (from BOT's last restart):** " + client.botMessages,
                    footer: {
                        text: client.devUsername
                    },
                };
                msg.edit({
                    embed: mess
                });
            });
        }
    });
}

module.exports.config = {
    name: "stats",
    description: "Get the BOT's statistics",
    usage: require("../config.json").prefix + "stats",
    accessableby: "Members",
    aliases: [],
    category: "🤖 BOT information",
    dmAvailable: true
}