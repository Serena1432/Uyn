const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("BAN_MEMBERS")) return message.reply(language.insufficientPermission);
    if (!message.mentions.members.size) return message.reply(language.pleaseMentionUser);
    if (message.mentions.members.first().user.id == message.author.id) return message.reply(language.cannotBanYourself);
    if (message.mentions.members.first().roles.highest.rawPosition >= message.member.roles.highest.rawPosition) return message.reply(language.higherThanYours);
    if (message.mentions.members.first().roles.highest.rawPosition >= message.guild.member(client.user).roles.highest.rawPosition) return message.reply(language.higherThanBOT);
    if (message.mentions.members.first().user.id == client.user.id) return message.reply(language.cannotBanThisBOT);
    if (!message.guild.member(client.user).permissions.has("KICK_MEMBERS")) return message.reply(language.noBanPermission);
    var reason = language.unspecified;
    args.splice(0, 1);
    if (args[0]) reason = args.join(" ");
    message.mentions.members.first().ban({
        reason: message.author.tag + " - " + reason
    });
    message.channel.send({
        embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: message.author.tag + language.hasJustBanned + message.mentions.members.first().user.tag,
                icon_url: message.author.avatarURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            },
            description: "**" + language.reason + ":** " + reason,
            footer: {
                text: language.senderID + message.author.id + language.mentionedMemberID + message.mentions.members.first().user.id,
                timestamp: message.timestamp
            }
        }
    });
    message.mentions.members.first().user.send({
        embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: language.banned.replace("$guild.name", message.guild.name),
                icon_url: message.guild.iconURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            },
            description: language.beingBannedBy + message.author.toString() + "\n**" + language.reason + ":** " + reason,
            footer: {
                text: language.senderID + message.author.id + language.mentionedMemberID + message.mentions.members.first().user.id,
                timestamp: message.timestamp
            }
        }
    });
}

module.exports.config = {
    name: "ban",
    description: "Ban someone",
    usage: require("../config.json").prefix + "ban @mention (reason)",
    accessableby: "Members",
    aliases: [],
    category: "⚙️ Moderations",
    dmAvailable: false
}