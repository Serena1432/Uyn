const request = require("request");

module.exports.get = function(client, req, res) {
    try {
        var reqTime = new Date();
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        var svStatus = "Unknown";
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
                        svStatus = "Operational";
                    } else {
                        svStatus = "Cannot connect to the SQL server";
                    }
                } else {
                    svStatus = "Cannot connect to the PHP server!";
                }
                var dated = new Date();
                var data = {
                    restart_time: client.startTime.getDate() + "/" + (client.startTime.getMonth() + 1) + "/" + client.startTime.getFullYear() + "; " + client.startTime.getHours() + ":" + client.startTime.getMinutes(),
                    active_time: days + "days, " + hours + "hours, " + minutes + "mins, " + parseInt(seconds) + "secs",
                    server_ping: (dated.getTime() - reqTime.getTime()) + " ms",
                    server_status: svStatus,
                    joined_servers: client.guilds.cache.size,
                    users: client.users.cache.size,
                    channels: client.channels.cache.size,
                    total_messages: client.sentMessages,
                    bot_messages: client.botMessages,
                    memory_usage: memoryUsage.rss,
                    cpu_usage: cpu.toFixed(2) + "%"
                };
                res.send(JSON.stringify(data));
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
    }
}