const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    var bots = 0,
        realMems = 0,
        onlineMems = 0;
    message.guild.members.cache.forEach(member => {
        if (!member.user.bot) realMems++;
        else bots++;
        if (member.presence.status == "online" || member.presence.status == "dnd" || member.presence.status == "idle") onlineMems++;
    });
    var highestRole = message.guild.roles.cache.sort((b, a) => a.rawPosition - b.rawPosition || a.id - b.id).first().toString();
    var embedBool = "No";
    if (message.guild.embedEnabled) embedBool = "Yes";
    var jd = message.guild.createdAt;
    var systemChannel = "Không có";
    if (message.guild.systemChannel) systemChannel = message.guild.systemChannel.toString();
    var createdDate = jd.getDate() + "/" + (jd.getMonth() + 1) + "/" + jd.getFullYear() + "; " + jd.getHours() + ":" + jd.getMinutes() + ":" + jd.getSeconds() + " (GMT +0)";
    const infoMessage = {
        color: Math.floor(Math.random() * 16777214) + 1,
        author: {
            name: message.guild.name
        },
        thumbnail: {
            url: message.guild.iconURL({
                format: "png",
                dynamic: true,
                size: 2048
            })
        },
        fields: [{
                name: "Icon URL:",
                value: "[Download](" + message.guild.iconURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                }) + ")",
                inline: false
            },
            {
                name: "Created at:",
                value: createdDate,
                inline: false
            },
            {
                name: "Owner:",
                value: message.guild.owner.toString(),
                inline: false
            },
            {
                name: "Member count:",
                value: message.guild.memberCount,
                inline: false
            },
            {
                name: "Number of BOTs:",
                value: bots,
                inline: true
            },
            {
                name: "Number of real members:",
                value: realMems,
                inline: true
            },
            {
                name: "Online members:",
                value: onlineMems,
                inline: true
            },
            {
                name: "Number of roles:",
                value: message.guild.roles.cache.filter(
                    role => role.name !== ""
                ).size - 1,
                inline: true
            },
            {
                name: "Highest role:",
                value: highestRole,
                inline: true
            },
            {
                name: "System channel:",
                value: systemChannel,
                inline: true
            },
            {
                name: "Verification level:",
                value: message.guild.verificationLevel.toString(),
                inline: true
            },
            {
                name: "Image filter level:",
                value: message.guild.explicitContentFilter.toString(),
                inline: true
            },
            {
                name: "Can send images? (the everyone role)",
                value: embedBool,
                inline: true
            },
            {
                name: "Server region:",
                value: message.guild.region,
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
    message.channel.send("Information about this server:", {
        embed: infoMessage
    });
}

module.exports.config = {
    name: "guild",
    description: "View this server's information",
    usage: require("../config.json").prefix + "guild",
    accessableby: "Members",
    aliases: [],
    category: "🚩 Server information",
    dmAvailable: false
}