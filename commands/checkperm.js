const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");
const Canvas = require("canvas");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args) => {
    var t1 = "❎ Manage Messages", t2 = "This BOT can't delete any messages in this server, including ping-responsing messages that will automatically deleted after 5 seconds.";
    if (message.guild.member(client.user).permissions.has("MANAGE_MESSAGES")) {
      t1 = "✅ Manage Messages";
      t2 = "This BOT can't delete any messages in this server, including ping-responsing messages that will automatically deleted after 5 seconds.";
    }
    var t3 = "❎ Manage Channels", t4 = "This BOT can't edit or delete any channels in this server.";
    if (message.guild.member(client.user).permissions.has("MANAGE_CHANNELS")) {
      t3 = "✅ Manage Channels";
      t4 = "This BOT can edit or delete any channels in this server.";
    }
    var t5 = "❎ Manage Roles", t6 = "This BOT can't create, edit or delete any roles in this server.";
    if (message.guild.member(client.user).permissions.has("MANAGE_ROLES")) {
      t5 = "✅ Manage Channels";
      t6 = "This BOT can create, edit or delete any roles in this server.";
    }
    var t7 = "❎ Kick Members", t8 = "This BOT can't kick any members in this server.";
    if (message.guild.member(client.user).permissions.has("KICK_MEMBERS")) {
      t7 = "✅ Kick Members";
      t8 = "This BOT can't kick any members in this server.";
    }
    var t9 = "❎ Ban Members", t10 = "This BOT can't ban any members in this server.";
    if (message.guild.member(client.user).permissions.has("BAN_MEMBERS")) {
      t9 = "✅ Ban Members";
      t10 = "This BOT can't ban any members in this server.";
    }
    var t11 = "❎ Manage Nicknames", t12 = "This BOT can't change nickname of any members in this server.";
    if (message.guild.member(client.user).permissions.has("MANAGE_NICKNAMES")) {
      t11 = "✅ Manage Nicknames";
      t12 = "This BOT can change nickname of any members in this server.";
    }
    const embed = {
        color: Math.floor(Math.random() * 16777214) + 1,
        author: {
            name: "Checking this BOT's permission in the " + message.guild.name + " server",
            icon_url: message.guild.iconURL({
                format: "png",
                dynamic: true,
                size: 2048
            })
        },
        fields: [
          {
            name: t1,
            value: t2,
            inline: false
          },
          {
            name: t3,
            value: t4,
            inline: false
          },
          {
            name: t5,
            value: t6,
            inline: false
          },
          {
            name: t7,
            value: t8,
            inline: false
          },
          {
            name: t9,
            value: t10,
            inline: false
          },
          {
            name: t11,
            value: t12,
            inline: false
          }
        ],
        footer: {
            text: client.user.tag,
            icon_url: client.user.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            })
        }
    };
    message.channel.send({embed: embed});
}

module.exports.config = {
    name: "checkperm",
    description: "Check BOT's permissions in this server",
    usage: "u!checkperm",
    accessableby: "Members",
    aliases: [],
    category: "🤖 BOT information",
    dmAvailable: false
}
