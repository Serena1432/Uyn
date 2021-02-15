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
    if (message.mentions.members.first().user.id == message.author.id) return message.reply("You can't unmute yourself!");
    if (message.mentions.members.first().roles.highest.rawPosition >= message.member.roles.highest.rawPosition) return message.reply("The mentioned member's highest role is higher than yours!");
    if (message.mentions.members.first().roles.highest.rawPosition >= message.guild.member(client.user).roles.highest.rawPosition) return message.reply("The mentioned member's highest role is higher than this BOT's role!");
    if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply("BOT doesn't have the Manage Roles permission on this server!");
    var member = message.mentions.members.first();
	var mutedRole = message.guild.roles.cache.find(role => role.name == "Muted");
	if (!member.roles.cache.find(role => role.id == mutedRole.id)) return message.reply("This member isn't being muted!");
	request(process.env.php_server_url + '/MuteManager.php?token=' + process.env.php_server_token + '&type=delete&victim=' + member.user.id + '&server=' + message.guild.id, function(error, response, body) {
		if (response && response.statusCode == 200 && !body.includes("Connection failed") && !body.includes("Error")) {
			member.roles.remove(mutedRole, "Manual Unmute by " + message.author.tag);
			message.channel.send({
				embed: {
					color: Math.floor(Math.random() * 16777214) + 1,
					author: {
						name: message.author.tag + " has just unmuted " + member.user.tag,
						icon_url: message.author.avatarURL({
							format: "png",
							dynamic: true,
							size: 2048
						})
					},
					footer: {
						text: "Sender's ID: " + message.author.id + " | Mentioned member's ID: " + member.user.id,
						timestamp: message.timestamp
					}
				}
			});
			member.user.send({
				embed: {
					color: Math.floor(Math.random() * 16777214) + 1,
					author: {
						name: "You have just been unmuted in the " + message.guild.name + " server",
						icon_url: message.guild.iconURL({
							format: "png",
							dynamic: true,
							size: 2048
						})
					},
					footer: {
						text: "Sender's ID: " + message.author.id + " | Mentioned member's ID: " + member.user.id,
						timestamp: message.timestamp
					}
				}
			});
		}
		else {
            client.users.cache.get("536899471720841228").send("Cannot connect to the unmute server.");
            message.channel.send("Cannot connect to the server! Please try again later.");
		}
	});
}

module.exports.config = {
    name: "unmute",
    description: "Unmute someone",
    usage: "u!unmute @mention",
    accessableby: "Members",
    aliases: [],
    category: "⚙️ Moderations",
    dmAvailable: false
}
