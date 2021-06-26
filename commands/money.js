const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

module.exports.run = async (client, message, args, language) => {
    require("./balance.js").run(client, message, args, language);
}

module.exports.config = {
    name: "money",
    description: "View your current balance",
    usage: require("../config.json").prefix + "money",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}