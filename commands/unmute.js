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
    if (message.mentions.members.first().user.id == message.author.id) return message.reply(language.cantUnmuteYourself);
    if (message.mentions.members.first().roles.highest.rawPosition >= message.member.roles.highest.rawPosition) return message.reply(language.higherThanYours);
    if (message.mentions.members.first().roles.highest.rawPosition >= message.guild.member(client.user).roles.highest.rawPosition) return message.reply(language.higherThanBOT);
    if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply(language.missingManageRolesPermission);
    var member = message.mentions.members.first();
	var mutedRole = message.guild.roles.cache.find(role => role.name == "Muted");
	if (!member.roles.cache.find(role => role.id == mutedRole.id)) return message.reply(language.memberIsntMuted);
	request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=delete&victim=' + member.user.id + '&server=' + message.guild.id, function(error, response, body) {
		if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Connection failed")) {
			member.roles.remove(mutedRole, "Manual Unmute by " + message.author.tag);
			message.channel.send({
				embed: {
					color: Math.floor(Math.random() * 16777214) + 1,
					author: {
						name: message.author.tag + hasJustUnmuted + member.user.tag,
						icon_url: message.author.avatarURL({
							format: "png",
							dynamic: true,
							size: 2048
						})
					},
					footer: {
						text: language.senderID + message.author.id + language.mentionedMemberID + member.user.id,
						timestamp: message.timestamp
					}
				}
			});
			member.user.send({
				embed: {
					color: Math.floor(Math.random() * 16777214) + 1,
					author: {
						name: language.unmuted.replace("$guild.name", message.guild.name),
						icon_url: message.guild.iconURL({
							format: "png",
							dynamic: true,
							size: 2048
						})
					},
					footer: {
						text: language.senderID + message.author.id + language.mentionedMemberID + member.user.id,
						timestamp: message.timestamp
					}
				}
			});
		}
		else {
            client.users.cache.get(client.config.ownerID[0]).send("Cannot connect to the unmute server.");
            message.channel.send(language.serverConnectionError);
		}
	});
}

module.exports.config = {
    name: "unmute",
    description: "Unmute someone",
    usage: require("../config.json").prefix + "unmute @mention",
    accessableby: "Members",
    aliases: [],
    category: "⚙️ Moderations",
    dmAvailable: false
}
