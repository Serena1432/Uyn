const fs = require('fs');
const request = require("request");
const ms = require('ms');
require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');
client.config = config;

client.customPrefixes = [];
client.economyManager = [];
client.messageCountdown = [];
client.captchas = {
    daily: [],
    hourly: [],
    weekly: [],
    monthly: []
};
client.countdown = [];
client.addRole = [];
client.muteLeaved = [];
client.trades = [];
client.divorce = [];
client.sell = [];
client.purge = [];
client.waifus = require("./waifus.json");
client.husbandos = require("./husbandos.json");
client.waifus.length = client.waifus.normal.length + client.waifus.rare.length + client.waifus.srare.length + client.waifus.ssrare.length + client.waifus.urare.length;
client.husbandos.length = client.husbandos.normal.length + client.husbandos.rare.length + client.husbandos.srare.length + client.husbandos.ssrare.length + client.husbandos.urare.length;

request(process.env.php_server_url + '/GetCustomPrefixes.php', function(error, response, body) {
    if (response && response.statusCode == 200 && !body.includes("Connection failed")) {
        // Refreshing the prefixes list
        client.customPrefixes = JSON.parse(body);
    }
});

/* Load all events */
fs.readdir("./events/", (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        console.log(`👌 Event loaded: ${eventName}`);
        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
});

client.on("guildMemberAdd", (member) => {
    for (var i = 0; i < client.mutes.length; i++) {
        if (client.mutes[i].victim == member.user.id && client.mutes[i].server == member.guild.id && client.mutes[i].endtime >= (new Date()).getTime()) {
            var mutedRole = member.guild.roles.cache.find(role => role.name == "Muted");
            member.roles.add(mutedRole, "Role persist");
            member.user.send({
                embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    author: {
                        name: "You have just been muted in " + member.guild.name,
                        icon_url: member.guild.iconURL({
                            format: "png",
                            dynamic: true,
                            size: 2048
                        })
                    },
                    description: "**Duration:**: " + ms(endtime - (new Date()).getTime(), {
                        long: true
                    }) + "**" + language.reason + ":** Roles persist",
                    footer: {
                        text: "Mentioned member's ID: " + member.user.id,
                        timestamp: (new Date()).getTime()
                    }
                }
            });
            setTimeout(function() {
                var guild = member.guild;
                var mutedRole = message.guild.roles.cache.find(role => role.name == "Muted");
                request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=delete&victim=' + member.user.id + '&server=' + guild.id, function(error, response, body) {
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
                                    text: "Mentioned member's ID: " + member.user.id,
                                    timestamp: (new Date()).getTime()
                                }
                            }
                        });
                    } else {
                        client.users.cache.get(client.config.ownerId[0]).send("Cannot connect to the unmute server.");
                    }
                });
            }, (endtime - (new Date()).getTime()));
			client.muteLeaved[member.user.id] = false;
        }
    }
    /*
    Temporarily remove it because the official support server is not yet created.
	if (member.guild.id == 653949728547143691) {
		const e = new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(client.devUsername, client.users.cache.get(client.config.ownerId[0]).avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setThumbnail(member.guild.iconURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTitle("Welcome " + member.user.username + " to the Uyn BOT's Official Server!")
			.setDescription("Welcome to the Official Server of the \"Uyn\" BOT! I'm really glad to see you joining this server!\nPlease don't hesitate to chat and ask anything about me, this server or the Uyn BOT! I really appreciate all of support!\nThe first thing you should do after joining this server is go to the #rules channel and make sure that you accepted our rules before doing anything in this server.\nAfter that, you can go to the #main-chat channel to begin chatting, the #get-roles channel to get some specific roles, or any channels that you want to do something with!\nHave fun chatting in this server! Don't forget to try using the Uyn BOT and tell me your experience with it!\n\nNote that the Uyn BOT is still in development so it still lacks many features! I will add more later!")
			.setTimestamp();
		client.channels.cache.get("810005345799503882").send(e);
		member.user.send(e);
	}
    */
});

client.commands = new Discord.Collection();

/* Load all commands */
fs.readdir("./commands/", (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        client.commands.set(commandName, props);
        console.log(`👌 Command loaded: ${commandName}`);
    });
});

// Login
client.login(process.env.BOT_TOKEN);
