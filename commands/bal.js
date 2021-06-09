const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

module.exports.run = async (client, message, args) => {
    require("./balance.js").run(client, message, args);
}

module.exports.config = {
    name: "bal",
    description: "View your current balance",
    usage: require("../config.json").prefix + "bal",
    accessableby: "Members",
    aliases: [],
	secretCommand: true,
    category: "💰 Economy",
    dmAvailable: true
}