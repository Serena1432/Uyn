const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    var bots = 0,
        realMems = 0,
        onlineMems = 0;
    message.guild.members.cache.forEach(member => {
        if (!member.user.bot) realMems++;
        else bots++;
        if (member.presence.status == "online" || member.presence.status == "dnd" || member.presence.status == "idle") onlineMems++;
    });
    var highestRole = message.guild.roles.cache.sort((b, a) => a.rawPosition - b.rawPosition || a.id - b.id).first().toString();
    var embedBool = language.no;
    if (message.guild.embedEnabled) embedBool = language.yes;
    var jd = message.guild.createdAt;
    var systemChannel = language.none;
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
                name: language.iconURL,
                value: "[" + language.download + "](" + message.guild.iconURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                }) + ")",
                inline: false
            },
            {
                name: language.createdAt,
                value: createdDate,
                inline: false
            },
            {
                name: language.owner,
                value: message.guild.owner.toString(),
                inline: false
            },
            {
                name: language.memberCount,
                value: message.guild.memberCount,
                inline: false
            },
            {
                name: language.numberOfBOTs,
                value: bots,
                inline: true
            },
            {
                name: language.realMembers,
                value: realMems,
                inline: true
            },
            {
                name: language.onlineMembers,
                value: onlineMems,
                inline: true
            },
            {
                name: language.numberOfRoles,
                value: message.guild.roles.cache.filter(
                    role => role.name !== ""
                ).size - 1,
                inline: true
            },
            {
                name: language.highestRole,
                value: highestRole,
                inline: true
            },
            {
                name: language.systemChannel,
                value: systemChannel,
                inline: true
            },
            {
                name: language.verificationLevel,
                value: message.guild.verificationLevel.toString(),
                inline: true
            },
            {
                name: language.imageFilter,
                value: message.guild.explicitContentFilter.toString(),
                inline: true
            },
            {
                name: language.canSendImages,
                value: embedBool,
                inline: true
            },
            {
                name: language.serverRegion,
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
    message.channel.send(language.serverInformation, {
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