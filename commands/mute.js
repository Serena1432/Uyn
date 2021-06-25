const Discord = require("discord.js");
const request = require("request");
const fs = require('fs');
const ms = require('ms');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("You don't have the `Manage Messages` permission to do this!");
    if (!message.mentions.members.size) return message.reply("You must mention an user!");
    if (message.mentions.members.first().user.id == message.author.id) return message.reply("You can't mute yourself!");
    if (message.mentions.members.first().roles.highest.rawPosition >= message.member.roles.highest.rawPosition) return message.reply("The mentioned member's highest role is higher than yours!");
    if (message.mentions.members.first().roles.highest.rawPosition >= message.guild.member(client.user).roles.highest.rawPosition) return message.reply("The mentioned member's highest role is higher than this BOT's role!");
    if (message.mentions.members.first().user.id == client.user.id) return message.reply("You cannot mute this BOT!");
    if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply("BOT doesn't have the Manage Roles permission on this server!");
    var reason = "Unspecified";
    var duration = undefined;
    var durationText = "";
    var member = message.mentions.members.first();
	var guild = message.guild;
	var author = message.author;
    args.splice(0, 1);
    if (args[0] && ms(args[0])) {
        duration = ms(args[0]);
        args.splice(0, 1);
    }
    if (args[0]) reason = args.join(" ");
    if (duration) durationText = "**Duration:** " + ms(duration, {
        long: true
    }) + "\n";
    var mutedRole = guild.roles.cache.find(role => role.name == "Muted");
    if (mutedRole) {
        if (mutedRole.position >= guild.member(client.user).roles.highest.position) return message.reply("The Muted role is higher than this BOT's highest role! Please contact the server admin to fix this issue!");
    } else {
        mutedRole = await guild.roles.create({
            data: {
                name: "Muted",
                color: "#000000",
                permissions: []
            },
            reason: "Create a new Muted role"
        });
        mutedRole.setPosition(guild.member(client.user).roles.highest.position - 1);
        message.channel.send("Created a new Muted role.");
        guild.channels.cache.forEach(async (channel, id) => {
            await channel.overwritePermissions([{
                id: mutedRole.id,
                deny: ['SEND_MESSAGES', 'ADD_REACTIONS'],
            }, ], "Change the permissions of the Muted role")
        });
    }
    if (member.roles.cache.find(role => role.id == mutedRole.id)) return message.reply("This member is already being muted!");
    if (duration) {
        request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=add&id=' + author.id + '&victim=' + member.user.id + '&server=' + guild.id + "&endtime=" + ((new Date()).getTime() + duration), function(error, response, body) {
            if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Connection failed")) {
                member.roles.add(mutedRole, "Muted by " + author.tag + " - " + reason);
                setTimeout(function() {
                    request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=delete&victim=' + member.user.id + '&server=' + guild.id, function(error, response, body) {
						if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Connection failed")) {
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
										timestamp: message.timestamp
									}
								}
							});
						}
						else {
							client.users.cache.get("536899471720841228").send("Cannot connect to the unmute server.");
						}
					});
                }, duration);
                message.channel.send({
                    embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        author: {
                            name: author.tag + " has just muted " + member.user.tag,
                            icon_url: author.avatarURL({
                                format: "png",
                                dynamic: true,
                                size: 2048
                            })
                        },
                        description: durationText + "**Reason:** " + reason,
                        footer: {
                            text: "Sender's ID: " + author.id + " | Mentioned member's ID: " + member.user.id,
                            timestamp: message.timestamp
                        }
                    }
                });
                member.user.send({
                    embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        author: {
                            name: "You have just been muted in the " + guild.name + " server",
                            icon_url: guild.iconURL({
                                format: "png",
                                dynamic: true,
                                size: 2048
                            })
                        },
                        description: "**Being muted by:** " + author.toString() + "\n" + durationText + "**Reason:** " + reason,
                        footer: {
                            text: "Sender's ID: " + author.id + " | Mentioned member's ID: " + member.user.id,
                            timestamp: message.timestamp
                        }
                    }
                });
            } else {
                client.users.cache.get("536899471720841228").send("Cannot connect to the mute server.");
                message.channel.send("Cannot connect to the server! Please try again later.");
            }
        });
		client.mutes.push({
			id: null,
			author: author.id,
			victim: member.user.id,
			server: guild.id,
			endtime: ((new Date()).getTime()) + duration
		});
    } else {
        member.roles.add(mutedRole, "Muted by " + author.tag + " - " + reason);
        message.channel.send({
            embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: author.tag + " has just muted " + member.user.tag,
                    icon_url: author.avatarURL({
                        format: "png",
                        dynamic: true,
                        size: 2048
                    })
                },
                description: "**Reason:** " + reason,
                footer: {
                    text: "Sender's ID: " + author.id + " | Mentioned member's ID: " + member.user.id,
                    timestamp: message.timestamp
                }
            }
        });
        member.user.send({
            embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: "You have just been muted in the " + guild.name + " server",
                    icon_url: guild.iconURL({
                        format: "png",
                        dynamic: true,
                        size: 2048
                    })
                },
                description: "**Being muted by:** " + author.toString() + "\n**Reason:** " + reason,
                footer: {
                    text: "Sender's ID: " + author.id + " | Mentioned member's ID: " + member.user.id,
                    timestamp: message.timestamp
                }
            }
        });
    }
}

module.exports.config = {
    name: "mute",
    description: "Mute someone",
    usage: require("../config.json").prefix + "mute @mention (duration) (reason)",
    accessableby: "Members",
    aliases: [],
    category: "⚙️ Moderations",
    dmAvailable: false
}
