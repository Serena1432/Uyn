const Discord = require("discord.js");
const request = require("request");
const fs = require('fs');
const ms = require('ms');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply(language.insufficentMessagePermission);
    if (!message.mentions.members.size) return message.reply(language.pleaseMentionUser);
    if (message.mentions.members.first().user.id == message.author.id) return message.reply(language.cannotMuteYourself);
    if (message.mentions.members.first().roles.highest.rawPosition >= message.member.roles.highest.rawPosition) return message.reply(language.higherThanYours);
    if (message.mentions.members.first().roles.highest.rawPosition >= message.guild.member(client.user).roles.highest.rawPosition) return message.reply(language.higherThanBOT);
    if (message.mentions.members.first().user.id == client.user.id) return message.reply(language.cannotMuteThisBOT);
    if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply(language.missingManageRolesPermission);
    var reason = language.unspecified;
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
    if (duration) durationText = "**" + language.duration + "** " + ms(duration, {
        long: true
    }) + "\n";
    var mutedRole = guild.roles.cache.find(role => role.name == "Muted");
    if (mutedRole) {
        if (mutedRole.position >= guild.member(client.user).roles.highest.position) return message.reply(language.higherMutedRole);
    } else {
        mutedRole = await guild.roles.create({
            data: {
                name: "Muted",
                color: "#000000",
                permissions: []
            },
            reason: language.mutedRoleReason
        });
        mutedRole.setPosition(guild.member(client.user).roles.highest.position - 1);
        message.channel.send(language.mutedRoleCreated);
        guild.channels.cache.forEach(async (channel, id) => {
            await channel.overwritePermissions([{
                id: mutedRole.id,
                deny: ['SEND_MESSAGES', 'ADD_REACTIONS'],
            }, ], language.muteRolePermissions)
        });
    }
    if (member.roles.cache.find(role => role.id == mutedRole.id)) return message.reply(language.alreadyBeingMuted);
    if (duration) {
        request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=add&id=' + author.id + '&victim=' + member.user.id + '&server=' + guild.id + "&endtime=" + ((new Date()).getTime() + duration), function(error, response, body) {
            if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Connection failed")) {
                member.roles.add(mutedRole, language.mutedBy + author.tag + " - " + reason);
                setTimeout(function() {
                    request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=delete&victim=' + member.user.id + '&server=' + guild.id, function(error, response, body) {
						if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Connection failed")) {
							member.roles.remove(mutedRole, language.automaticUnmute);
							member.user.send({
								embed: {
									color: Math.floor(Math.random() * 16777214) + 1,
									author: {
										name: language.unmuted.replace("$guild.name", guild.name),
										icon_url: guild.iconURL({
											format: "png",
											dynamic: true,
											size: 2048
										})
									},
									description: language.automaticUnmuteReason,
									footer: {
										text: language.senderID + author.id + language.mentionedMemberID + member.user.id,
										timestamp: message.timestamp
									}
								}
							});
						}
						else {
							client.users.cache.get(client.config.ownerID[0]).send("Cannot connect to the unmute server.");
						}
					});
                }, duration);
                message.channel.send({
                    embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        author: {
                            name: author.tag + language.hasJustMuted + member.user.tag,
                            icon_url: author.avatarURL({
                                format: "png",
                                dynamic: true,
                                size: 2048
                            })
                        },
                        description: durationText + "**" + language.reason + ":** " + reason,
                        footer: {
                            text: language.senderID + author.id + language.mentionedMemberID + member.user.id,
                            timestamp: message.timestamp
                        }
                    }
                });
                member.user.send({
                    embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        author: {
                            name: language.muted.replace("$guild.name", guild.name),
                            icon_url: guild.iconURL({
                                format: "png",
                                dynamic: true,
                                size: 2048
                            })
                        },
                        description: language.beingMutedBy + author.toString() + "\n" + durationText + "**" + language.reason + ":** " + reason,
                        footer: {
                            text: language.senderID + author.id + language.mentionedMemberID + member.user.id,
                            timestamp: message.timestamp
                        }
                    }
                });
            } else {
                client.users.cache.get(client.config.ownerID[0]).send("Cannot connect to the mute server.");
                message.channel.send(language.serverConnectionError);
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
        member.roles.add(mutedRole, language.mutedBy + author.tag + " - " + reason);
        message.channel.send({
            embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: author.tag + language.hasJustMuted + member.user.tag,
                    icon_url: author.avatarURL({
                        format: "png",
                        dynamic: true,
                        size: 2048
                    })
                },
                description: "**" + language.reason + ":** " + reason,
                footer: {
                    text: language.senderID + author.id + language.mentionedMemberID + member.user.id,
                    timestamp: message.timestamp
                }
            }
        });
        member.user.send({
            embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: language.muted,
                    icon_url: guild.iconURL({
                        format: "png",
                        dynamic: true,
                        size: 2048
                    })
                },
                description: language.beingMutedBy + author.toString() + "\n**" + language.reason + ":** " + reason,
                footer: {
                    text: language.senderID + author.id + language.mentionedMemberID + member.user.id,
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
