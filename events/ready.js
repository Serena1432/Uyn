const express = require("express");
const request = require("request");
const app = express();
const fs = require("fs");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
module.exports = (client) => {
    const server = app.listen(process.env.PORT || 3000, () => {
        console.log(`Express running → PORT ${server.address().port}`);
    });
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.get("/", (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.send("true");
    });
    app.get("/:page", (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        if (fs.existsSync("./web/" + req.params.page + ".js")) {
            const page = require("../web/" + req.params.page + ".js");
            if (!page.get) return res.status(405).send(JSON.stringify({code: 405, error: "405: Method Not Allowed"}));
            page.get(client, req, res);
        }
        else res.status(400).send(JSON.stringify({code: 400, error_type: "UynWebPageError", error: "This page command doesn't exist: " + req.params.page}));
    });
    app.post("/:page", (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        if (fs.existsSync("./web/" + req.params.page + ".js")) {
            const page = require("../web/" + req.params.page + ".js");
            if (!page.post) return res.status(405).send(JSON.stringify({code: 405, error: "405: Method Not Allowed"}));
            page.post(client, req, res);
        }
        else res.status(400).send(JSON.stringify({code: 400, error_type: "UynWebPageError", error: "This page command doesn't exist: " + req.params.page}));
    });
    app.post('/VoteReceiver', (req, res) => {
        if (process.env.dbl_vote_authorization) {
            if (req.headers.authorization != process.env.dbl_vote_authorization) return res.status(401).send("Invalid authorization token");
            if (!req.body.user) return res.status(500).send("Cannot find the user!");
            console.log(req.body.user);
            var user = client.users.cache.get(req.body.user);
            if (!user) return res.status(500).send("Cannot find the user!");
            user.send("Thank you for voting me " + user.username + "!\n(Note: This Vote Message feature is still in development; maybe a Voting Reward will coming soon if this BOT is completely developed)");
            res.send("Success!");
        }
        else res.status(401).send("ERROR: Cannot find the 'dbl_vote_authorization' environment variable; please add it and try again");
    })
    console.log(`Ready as ${client.user.tag} to server in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`);
    client.users.fetch(client.config.ownerId[0]).then((user) => {
        user.send("BOT has been restarted!");
    });
    setInterval(function() {
        client.devUsername = client.users.cache.get(client.config.ownerId[0]).tag;
        gamePlaying = ['with ' + client.devUsername, 'on ' + client.guilds.cache.size + ' servers with ' + client.users.cache.size + ' members!', 'based on Discord.JS v12.4.1; BOT version v2021.2.13', 'with ' + client.config.prefix + 'help command'];
        if (client.config.ownerId.length > 1) {
            for (var i = 1; i < client.config.ownerId.length; i++) {
                gamePlaying.push("with " + client.users.cache.get(client.config.ownerId[i]).tag);
            }
        }
    }, 5000);
    setInterval(function() {
        var rand = random(0, gamePlaying.length);
        client.user.setStatus('online');
        client.user.setActivity(gamePlaying[rand], {
            type: "PLAYING"
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
            client.users.cache.get(client.config.ownerId[0]).send("Ping-responsing system failed to initialize.");
        }
    });
    request(process.env.php_server_url + '/ToggleQuote.php?token=' + process.env.php_server_token + '&type=get', function(error, response, body) {
        if (response && !body.includes("Connection failed")) {
            client.toggleQuote = JSON.parse(body);
            console.log("👌 Ping-responsing toggle mode successfully initialized");
        } else {
            console.error(error);
            console.error(body);
            client.users.cache.get(client.config.ownerId[0]).send("Ping-responsing toggle mode failed to initialize.");
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
        } else client.users.cache.get(client.config.ownerId[0]).send("Mute system failed to initialize.");
    });
    request(process.env.php_server_url + '/GetCustomPrefixes.php', function(error, response, body) {
        if (response && response.statusCode == 200 && !body.includes("Connection failed")) {
            client.customPrefixes = JSON.parse(body);
            console.log("👌 Custom prefixes succesfully get");
        }
    });
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
            if (!error && response.statusCode == 200 && !body.includes("Error")) {
                try {
                    client.economyManager = JSON.parse(body);
                    console.log("👌 Economy system successfully initialized");
                }
                catch (err) {
                    console.error(err);
                }
            }
            else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
    });
	if (process.env.dbl_token) {
		const DBL = require("dblapi.js");
		const dbl = new DBL(process.env.dbl_token, client);
		setInterval(() => {
			dbl.postStats(client.guilds.cache.size);
		}, 1800000);
	}
};
