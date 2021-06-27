const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply(language.insufficentMessagePermission); 
    if (!message.mentions.members.size) return message.reply(language.pleaseMentionUser);
    if (message.mentions.members.first().user.id == message.author.id) return message.reply("You can't warn yourself!");
    if (message.mentions.members.first().roles.highest.rawPosition >= message.member.roles.highest.rawPosition) return message.reply(language.higherThanYours);
    if (message.mentions.members.first().user.id == client.user.id) return message.reply("You can't warn this BOT!");
    var reason = language.unspecified;
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
            description: "**" + language.reason + ":** " + reason,
            footer: {
                text: language.senderID + message.author.id + language.mentionedMemberID + message.mentions.members.first().id,
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
            description: "**Being warned by:** " + message.author.toString() + "\n**" + language.reason + ":** " + reason,
            footer: {
                text: language.senderID + message.author.id + language.mentionedMemberID + message.mentions.members.first().id,
                timestamp: message.timestamp
            }
        }
    });
}

module.exports.config = {
    name: "warn",
    description: "Warn someone",
    usage: require("../config.json").prefix + "warn @mention (reason)",
    accessableby: "Members",
    aliases: [],
    category: "⚙️ Moderations",
    dmAvailable: false
}
