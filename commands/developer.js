const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    message.delete({
        timeout: 10000
    });
    var member = client.users.cache.get(client.config.ownerId[0]);
    var guildMember;
    if (message.channel.type == "text") {
        guildMember = message.guild.member(client.users.cache.get(client.config.ownerId[0]));
        if (guildMember) {
            var jd = member.createdAt;
            var dateString = jd.getDate() + "/" + (jd.getMonth() + 1) + "/" + jd.getFullYear() + "; " + jd.getHours() + ":" + jd.getMinutes() + ":" + jd.getSeconds() + " (GMT +0)";
            var gjd = guildMember.joinedAt;
            var admin = "No";
            if (guildMember.permissions.has("ADMINISTRATOR")) admin = "Yes";
            var kickMem = "No";
            if (guildMember.permissions.has("KICK_MEMBERS")) kickMem = "Yes";
            var banMem = "No";
            if (guildMember.permissions.has("BAN_MEMBERS")) banMem = "Yes";
            var roleManager = "No";
            if (guildMember.permissions.has("MANAGE_ROLES")) roleManager = "Yes";
            var channelManager = "No";
            if (guildMember.permissions.has("MANAGE_CHANNELS")) channelManager = "Yes";
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
                        name: "Display Name:",
                        value: "<@" + member.id + ">",
                        inline: true
                    },
                    {
                        name: "Member ID:",
                        value: member.id,
                        inline: true
                    },
                    {
                        name: "Avatar URL:",
                        value: "[Download](" + member.avatarURL({
                            format: "png",
                            dynamic: true,
                            size: 2048
                        }) + ")",
                        inline: true
                    },
                    {
                        name: "Account created in:",
                        value: dateString,
                        inline: false
                    },
                    {
                        name: "Joined this server in:",
                        value: joinDateString,
                        inline: false
                    },
                    {
                        name: "Number of roles:",
                        value: guildMember.roles.cache.filter(
                            role => role.name !== ""
                        ).size - 1,
                        inline: true
                    },
                    {
                        name: "Highest role",
                        value: guildMember.roles.highest.toString(),
                        inline: true
                    },
                    {
                        name: "Current Display Color:",
                        value: guildMember.displayHexColor,
                        inline: false
                    },
                    {
                        name: "\u200b",
                        value: "\u200b",
                        inline: false
                    },
                    {
                        name: "Is an administrator?",
                        value: admin,
                        inline: true
                    },
                    {
                        name: "Can kick members?",
                        value: kickMem,
                        inline: true
                    },
                    {
                        name: "Can ban members?",
                        value: banMem,
                        inline: true
                    },
                    {
                        name: "Can manage roles?",
                        value: roleManager,
                        inline: true
                    },
                    {
                        name: "Can manage channels?",
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
                        name: "Display Name:",
                        value: "<@" + member.id + ">",
                        inline: true
                    },
                    {
                        name: "Member ID:",
                        value: member.id,
                        inline: true
                    },
                    {
                        name: "Avatar URL:",
                        value: "[Download](" + member.avatarURL({
                            format: "png",
                            dynamic: true,
                            size: 2048
                        }) + ")",
                        inline: true
                    },
                    {
                        name: "Account created in:",
                        value: dateString,
                        inline: false
                    },
                    {
                        name: "Some information cannot be displayed because this user don't join this server as well.",
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
            message.channel.send(client.devUsername + " is this BOT's developer!", {
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
                    name: "Display Name:",
                    value: "<@" + member.id + ">",
                    inline: true
                },
                {
                    name: "Member ID:",
                    value: member.id,
                    inline: true
                },
                {
                    name: "Avatar URL:",
                    value: "[Download](" + member.avatarURL({
                        format: "png",
                        dynamic: true,
                        size: 2048
                    }) + ")",
                    inline: true
                },
                {
                    name: "Account created in:",
                    value: dateString,
                    inline: false
                },
                {
                    name: "Some information cannot be displayed because you're using this command on a Direct Messages channel.",
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
        message.channel.send(client.devUsername + " is this BOT's developer!", {
            embed: infoMessage
        });
    }
}

module.exports.config = {
    name: "developer",
    description: "View developer's information",
    usage: "u!developer",
    accessableby: "Members",
    aliases: [],
    category: "👥 User information",
    dmAvailable: true
}