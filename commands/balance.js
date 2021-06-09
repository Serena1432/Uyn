const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

module.exports.run = async (client, message, args) => {
    if (!message.mentions.users.size) {
        if (client.economyManager[message.author.id]) {
            if (!client.economyManager[message.author.id].coins) return message.reply("Cannot get the coins information.");
            try {
                message.reply("You currently have **" + decrypt(client.economyManager[message.author.id].coins) + " " + client.config.currency + "**!");
            }
            catch (err) {
                console.log(err);
                return message.reply("An unexpected error occurred.");
            }
        }
        else return message.reply("I can't get your economy information; can you try initializing/refreshing your information using the `init` command?");
    }
    else {
        if (client.economyManager[message.mentions.users.first().id]) {
            if (!client.economyManager[message.mentions.users.first().id].coins) return message.reply("Cannot get the coins information.");
            try {
                message.reply("**" + message.mentions.users.first().username + "** currently have **" + decrypt(client.economyManager[message.mentions.users.first().id].coins) + " " + client.config.currency + "**!");
            }
            catch (err) {
                console.log(err);
                return message.reply("An unexpected error occurred.");
            }
        }
        else return message.reply("I can't get the mentioned user's economy information; can you tell him/her to initialize/refresh his/her information using the `init` command?");
    }
}

module.exports.config = {
    name: "balance",
    description: "View your current balance",
    usage: require("../config.json").prefix + "balance",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}