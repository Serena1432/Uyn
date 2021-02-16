const express = require("express");
const request = require("request");
const app = express();

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
module.exports = (client) => {
    const server = app.listen(process.env.PORT || 3000, () => {
        console.log(`Express running → PORT ${server.address().port}`);
    });
    app.get("/", (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.send("true");
    });
    console.log(`Ready as ${client.user.tag} to server in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`);
    client.users.fetch(client.config.ownerId).then((user) => {
        user.send("BOT has been restarted!");
    });
    setInterval(function() {
        client.devUsername = client.users.cache.get(client.config.ownerId).tag;
        gamePlaying = ['with ' + client.devUsername, 'on ' + client.guilds.cache.size + ' servers with ' + client.users.cache.size + ' members!', 'based on Discord.JS v12.4.1; BOT version v2021.2.13', 'with ' + client.config.prefix + 'help command'];
    }, 5000);
    var gameType = ['PLAYING', 'PLAYING', 'PLAYING', 'PLAYING'];
    setInterval(function() {
        var rand = random(0, gamePlaying.length);
        client.user.setStatus('online');
        client.user.setActivity(gamePlaying[rand], {
            type: gameType[rand]
        });
    }, 10000);
    client.startTime = new Date();
    client.sentMessages = 0;
    client.botMessages = 0;
    client.quotes = [];
    client.floodchat = [];
    client.mutes = [];
    client.toggleQuote = [];
    request(process.env.php_server_url + '/GetAllQuotes.php', function(error, response, body) {
        if (response && response.statusCode == 200 && !body.includes("Connection failed")) {
            client.quotes = JSON.parse(body);
            console.log("👌 Ping-responsing system successfully initialized");
        } else {
            console.error(error);
            console.error(body);
            client.users.cache.get(client.config.ownerId).send("Ping-responsing system failed to initialize.");
        }
    });
    request(process.env.php_server_url + '/ToggleQuote.php?token=' + process.env.php_server_token + '&type=get', function(error, response, body) {
        if (response && !body.includes("Connection failed")) {
            client.toggleQuote = JSON.parse(body);
            console.log("👌 Ping-responsing toggle mode successfully initialized");
        } else {
            console.error(error);
            console.error(body);
            client.users.cache.get(client.config.ownerId).send("Ping-responsing toggle mode failed to initialize.");
        }
    });
    request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=get', function(error, response, body) {
        if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Error")) {
            console.log("👌 Mute system successfully initialized");
            client.mutes = JSON.parse(body);
            var mutes = JSON.parse(body);
            setInterval(function() {
                for (var i = 0; i < mutes.length; i++) {
                    var id = mutes[i].id;
                    var guild = client.guilds.cache.get(mutes[i].server);
                    if (guild) {
                        var member = guild.members.cache.get(mutes[i].victim);
                        var author = client.users.cache.get(mutes[i].author);
                        var endtime = mutes[i].endtime;
                        var time = (new Date()).getTime();
                        var mutedRole = guild.roles.cache.find(role => role.name == "Muted");
                        if (member) {
                            console.log("Mute ID " + id + " in i = " + i + ": author: " + author.tag + "; victim: " + member.user.tag + "; guild: " + guild.name + "; endtime: " + endtime + "; currentTime: " + time + "; diff: " + (endtime - time));
                            if (endtime <= time && member.roles.cache.find(role => role.id == mutedRole.id)) {
                                request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=delete&victim=' + member.user.id + '&server=' + guild.id, function(error, response, body) {
                                    request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=get', function(error, response, body) {
                                        if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Error")) {
                                            console.log("👌 Mute system successfully updated");
                                            client.mutes = JSON.parse(body);
                                            mutes = JSON.parse(body);
                                            if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Error")) {
                                                member.roles.remove(mutedRole, "Automatic Unmute");
                                                member.user.send({
                                                    embed: {
                                                        color: Math.floor(Math.random() * 16777214) + 1,
                                                        author: {
                                                            name: "You have just been unmuted in the " + guild.name + " server",
                                                            icon_url: guild.iconURL({
                                                                format: "png",
                                                                dynamic: true,
                                                                size: 2048
                                                            })
                                                        },
                                                        description: "**Reason**: Automatic Unmute",
                                                        footer: {
                                                            text: "Sender's ID: " + author.id + " | Mentioned member's ID: " + member.user.id,
                                                            timestamp: (new Date()).getTime()
                                                        }
                                                    }
                                                });
                                                console.log("Successfully unmuted " + member.user.tag + " because the time is up.");
                                            } else {
                                                console.log("Failed to unmute " + member.user.tag + ".");
                                                client.users.cache.get(client.config.ownerId).send("Cannot connect to the unmute server.");
                                            }
                                        }
                                    });
                                });
                            } else if (!member.roles.cache.find(role => role.id == mutedRole.id)) {
                                request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=delete&victim=' + member.user.id + '&server=' + guild.id, function(error, response, body) {
                                    if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Error")) {
                                        request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=get', function(error, response, body) {
                                            if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Error")) {
                                                console.log("👌 Mute system successfully updated");
                                                client.mutes = JSON.parse(body);
                                                mutes = JSON.parse(body);
                                            }
                                        });
                                        console.log("Successfully unmuted " + member.user.tag + " because no Muted role was found.");
                                    } else {
                                        console.log("Failed to unmute " + member.user.tag + ".");
                                        client.users.cache.get(client.config.ownerId).send("Cannot connect to the unmute server.");
                                    }
                                });
                            }
                        } else {
                            client.muteLeaved[mutes[i].victim] = true;
                        }
                    }
                }
            }, 5000);
        } else client.users.cache.get(client.config.ownerId).send("Mute system failed to initialize.");
    });
};
