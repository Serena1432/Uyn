const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    if (!message.member.permissions.has("KICK_MEMBERS") && message.author.id != 536899471720841228) return message.reply("You don't have the rights to do this!");
    if (!message.mentions.members.size) return message.reply("You must mention an user!");
    if (message.mentions.members.first().user.id == message.author.id) return message.reply("You can't warn yourself!");
    if (message.mentions.members.first().roles.highest.rawPosition >= message.member.roles.highest.rawPosition) return message.reply("The mentioned member's highest role is higher than yours!");
    if (message.mentions.members.first().user.id == client.user.id) return message.reply("You can't warn this BOT!");
    var reason = "Unspecified";
    args.splice(0, 1);
    if (args[0]) reason = args.join(" ");
    message.channel.send({
        embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: message.author.tag + " has just warned " + message.mentions.members.first().user.tag,
                icon_url: message.author.avatarURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            },
            description: "**Reason:** " + reason,
            footer: {
                text: "Sender's ID: " + message.author.id + " | Mentioned member's ID: " + message.mentions.members.first().id,
                timestamp: message.timestamp
            }
        }
    });
    message.mentions.members.first().send({
        embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: "You have just been warned on the " + message.guild.name + " server",
                icon_url: message.guild.iconURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            },
            description: "**Being warned by:** " + message.author.toString() + "\n**Reason:** " + reason,
            footer: {
                text: "Sender's ID: " + message.author.id + " | Mentioned member's ID: " + message.mentions.members.first().id,
                timestamp: message.timestamp
            }
        }
    });
}

module.exports.config = {
    name: "warn",
    description: "Warn someone",
    usage: "u!warn @mention (reason)",
    accessableby: "Members",
    aliases: [],
    category: "⚙️ Moderations",
    dmAvailable: false
}