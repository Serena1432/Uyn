const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");

module.exports.run = async (client, message, args, language) => {
    message.delete({
        timeout: 10000
    });
    message.channel.send("", {
        embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            description: language.connectingToServer
        }
    }).then(msg => {
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        var svStatus = language.unknown;
        var quoteInfo = "";
        const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
        const memoryData = process.memoryUsage();
        const memoryUsage = {
            rss: `${formatMemoryUsage(memoryData.rss)}`,
            heapTotal: `${formatMemoryUsage(memoryData.heapTotal)}`,
            heapUsed: `${formatMemoryUsage(memoryData.heapUsed)}`,
            external: `${formatMemoryUsage(memoryData.external)}`,
        };
        var os = require('os-utils');
        os.cpuUsage(cpu => {
            request(process.env.php_server_url + '/GetAllQuotes.php', function(error, response, body) {
                if (response && response.statusCode == 200) {
                    if (!body.includes("Connection failed")) {
                        svStatus = language.operational;
                    } else {
                        svStatus = language.sqlServerError;
                    }
                } else {
                    svStatus = language.phpServerError;
                }
                var dated = new Date(), waifus = client.waifus, husbandos = client.husbandos;
                const mess = {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: language.statsTitle,
                    description: "⏰ **" + language.restartTime + "**: " + client.startTime.getDate() + "/" + (client.startTime.getMonth() + 1) + "/" + client.startTime.getFullYear() + "; " + client.startTime.getHours() + ":" + client.startTime.getMinutes() + "\n⬆️ **" + language.activeTime + ":** " + days + language.days + ", " + hours + language.hours + ", " + minutes + language.mins + ", " + parseInt(seconds) + language.secs + "\n🙂 **" + language.serverResponse + ":** " + (dated.getTime() - message.createdTimestamp) + " ms\n🖥️ **" + language.serverStatus + ":** " + svStatus + "\n" + quoteInfo + "🚩 **Joined servers:** " + client.guilds.cache.size + "\n👪 **Number of users:** " + client.users.cache.size + "\n#️⃣ **Channels:** " + client.channels.cache.size + "\n💬 **Number of messages sent (from BOT's last restart):** " + client.sentMessages + "\n🤖 **Number of commands executed (from BOT's last restart):** " + client.botMessages + "\n💭 **BOT's Memory Usage:**\n- **Resident Set Size:** " + memoryUsage.rss + "\n- **Heap Total Size:** " + memoryUsage.heapTotal + "\n- **Heap Used Size:** " + memoryUsage.heapUsed + "\n- **V8 External Memory:** " + memoryUsage.external + "\n🤖 **CPU Usage:** " + cpu.toFixed(2) + "%\n👧 **No. of Waifus in the database:** " + waifus.length.toLocaleString() + " (" + waifus.normal.length.toLocaleString() + " Normal, " + waifus.rare.length.toLocaleString() + " Rare, " + waifus.srare.length.toLocaleString() + " Super Rare, " + waifus.ssrare.length.toLocaleString() + " SS Rare, " + waifus.urare.length.toLocaleString() + " Ultra Rare)\n👦 **No. of Husbandos in the database:** " + husbandos.length.toLocaleString() + " (" + husbandos.normal.length.toLocaleString() + " Normal, " + husbandos.rare.length.toLocaleString() + " Rare, " + husbandos.srare.length.toLocaleString() + " Super Rare, " + husbandos.ssrare.length.toLocaleString() + " SS Rare, " + husbandos.urare.length.toLocaleString() + " Ultra Rare)\n",
                    footer: {
                        text: client.devUsername
                    },
                };
                msg.edit({
                    embed: mess
                });
            });
        });
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