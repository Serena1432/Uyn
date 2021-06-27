const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args, language) => {
    message.delete({
        timeout: 10000
    });
    if (args[0]) {
        var text = args.join(" ");
        let membersWithRole = message.guild.members.cache.filter(member => {
            return member.roles.cache.find(role => role.name == text);
        }).map(member => {
            return member.user.tag + " (" + member.user.id + ")";
        })
        const mess = {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: language.role.replace("$role", text),
            description: membersWithRole.join("\n"),
            footer: {
                text: ''
            }
        };
        message.channel.send({
            embed: mess
        });
    } else {
        message.reply(language.missingRoleName);
    }
}

module.exports.config = {
    name: "role",
    description: "Get all the members that have a specific role",
    usage: require("../config.json").prefix + "role (name)",
    accessableby: "Members",
    aliases: [],
    category: "🚩 Server information",
    dmAvailable: false
}