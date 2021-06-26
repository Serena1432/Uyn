const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    message.delete({
        timeout: 10000
    });
    var member = message.author;
    var guildMember;
    if (message.channel.type == "text") guildMember = message.member;
    if (message.mentions.users.size) {
        member = message.mentions.users.first();
        if (message.channel.type == "text") guildMember = message.mentions.members.first();
    } else if (!message.mentions.users.size && args[0]) {
        member = client.users.cache.get(args[0]);
        if (message.channel.type == "text") guildMember = message.guild.member(client.users.cache.get(args[0]));
    }
    if (member) {
        if (message.channel.type == "text") {
            if (guildMember) {
                var jd = member.createdAt;
                var dateString = jd.getDate() + "/" + (jd.getMonth() + 1) + "/" + jd.getFullYear() + "; " + jd.getHours() + ":" + jd.getMinutes() + ":" + jd.getSeconds() + " (GMT +0)";
                var gjd = guildMember.joinedAt;
                var admin = "No";
                if (guildMember.permissions.has("ADMINISTRATOR")) admin = language.yes;
                var kickMem = "No";
                if (guildMember.permissions.has("KICK_MEMBERS")) kickMem = language.yes;
                var banMem = "No";
                if (guildMember.permissions.has("BAN_MEMBERS")) banMem = language.yes;
                var roleManager = "No";
                if (guildMember.permissions.has("MANAGE_ROLES")) roleManager = language.yes;
                var channelManager = "No";
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
                message.channel.send({
                    embed: infoMessage
                });
            }
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
                        name: language.userInfoOnDM,
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
            message.channel.send({
                embed: infoMessage
            });
        }
    } else {
        message.reply(language.userNotExist);
    }
}

module.exports.config = {
    name: "account",
    description: "View your or someone's information",
    usage: require("../config.json").prefix + "account @mention",
    accessableby: "Members",
    aliases: ["whois"],
    category: "👥 User information",
    dmAvailable: true
}