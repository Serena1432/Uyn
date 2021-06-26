const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    message.delete({
        timeout: 10000
    });
    var member = message.guild.owner.user;
    var guildMember = message.guild.owner;
    if (guildMember) {
        var jd = member.createdAt;
        var dateString = jd.getDate() + "/" + (jd.getMonth() + 1) + "/" + jd.getFullYear() + "; " + jd.getHours() + ":" + jd.getMinutes() + ":" + jd.getSeconds() + " (GMT +0)";
        var gjd = guildMember.joinedAt;
        var admin = language.no;
        if (guildMember.permissions.has("ADMINISTRATOR")) admin = language.yes;
        var kickMem = language.no;
        if (guildMember.permissions.has("KICK_MEMBERS")) kickMem = language.yes;
        var banMem = language.no;
        if (guildMember.permissions.has("BAN_MEMBERS")) banMem = language.yes;
        var roleManager = language.no;
        if (guildMember.permissions.has("MANAGE_ROLES")) roleManager = language.yes;
        var channelManager = language.no;
        if (guildMember.permissions.has("MANAGE_CHANNELS")) channelManager = language.yes;
        var joinDateString = gjd.getDate() + "/" + (gjd.getMonth() + 1) + "/" + gjd.getFullYear() + "; " + gjd.getHours() + ":" + gjd.getMinutes() + ":" + gjd.getSeconds() + " (GMT +0)";
        const infoMessage = {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: member.tag + " (" + member.presence.status + ")"
            },
            thumbnail: {
                url: member.avatarURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            },
            fields: [{
                    name: language.displayName,
                    value: "<@" + member.id + ">",
                    inline: true
                },
                {
                    name: language.memberID,
                    value: member.id,
                    inline: true
                },
                {
                    name: language.avatarURL,
                    value: "[" + language.download + "](" + member.avatarURL({
                        format: "png",
                        dynamic: true,
                        size: 2048
                    }) + ")",
                    inline: true
                },
                {
                    name: language.accountCreatedIn,
                    value: dateString,
                    inline: false
                },
                {
                    name: language.joinedServerIn,
                    value: joinDateString,
                    inline: false
                },
                {
                    name: language.numberOfRoles,
                    value: guildMember.roles.cache.filter(
                        role => role.name !== ""
                    ).size - 1,
                    inline: true
                },
                {
                    name: language.highestRole,
                    value: guildMember.roles.highest.toString(),
                    inline: true
                },
                {
                    name: language.currentDisplayColor,
                    value: guildMember.displayHexColor,
                    inline: false
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: false
                },
                {
                    name: language.isAdmin,
                    value: admin,
                    inline: true
                },
                {
                    name: language.canKickMem,
                    value: kickMem,
                    inline: true
                },
                {
                    name: language.canBanMem,
                    value: banMem,
                    inline: true
                },
                {
                    name: language.canManageRoles,
                    value: roleManager,
                    inline: true
                },
                {
                    name: language.canManageChannel,
                    value: channelManager,
                    inline: true
                },
            ],
            footer: {
                text: client.devUsername,
                icon_url: client.user.avatarURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            }
        };
        message.channel.send({
            embed: infoMessage
        });
    } else {
        var jd = member.createdAt;
        var dateString = jd.getDate() + "/" + (jd.getMonth() + 1) + "/" + jd.getFullYear() + "; " + jd.getHours() + ":" + jd.getMinutes() + ":" + jd.getSeconds() + " (GMT +0)";
        const infoMessage = {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: member.tag + " (" + member.presence.status + ")"
            },
            thumbnail: {
                url: member.avatarURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            },
            fields: [{
                    name: language.displayName,
                    value: "<@" + member.id + ">",
                    inline: true
                },
                {
                    name: language.memberID,
                    value: member.id,
                    inline: true
                },
                {
                    name: language.avatarURL,
                    value: "[" + language.download + "](" + member.avatarURL({
                        format: "png",
                        dynamic: true,
                        size: 2048
                    }) + ")",
                    inline: true
                },
                {
                    name: language.accountCreatedIn,
                    value: dateString,
                    inline: false
                },
                {
                    name: language.userDontJoinGuild,
                    value: "\u200b",
                    inline: false
                },
            ],
            footer: {
                text: client.devUsername,
                icon_url: client.user.avatarURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            }
        };
        message.channel.send("Information about this server's owner: ", {
            embed: infoMessage
        });
    }
}

module.exports.config = {
    name: "owner",
    description: "View this server's owner information",
    usage: require("../config.json").prefix + "owner",
    accessableby: "Members",
    aliases: [],
    category: "👥 User information",
    dmAvailable: false
}