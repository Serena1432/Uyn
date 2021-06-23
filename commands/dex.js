const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args) => {
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    try {
        if (!args[0]) return message.reply("Please type a waifu ID!");
        if (!args[0].includes(".")) return message.reply("The waifu ID should be `type.id_number` (for example, `wn.1`)!");
        var type = args[0].split(".")[0], id = args[0].split(".")[1];
        if (!id) return message.reply("The waifu ID should be `type.id_number` (for example, `wn.1`)!");
        if (isNaN(id)) return message.reply("The waifu ID should be `type.id_number` (for example, `wn.1`)!");
        var obj, rarity;
        switch (type) {
            case "wn": {obj = client.waifus.normal; rarity = "Normal"; break}
            case "wr": {obj = client.waifus.rare; rarity = "Rare"; break}
            case "wsr": {obj = client.waifus.srare; rarity = "Super Rare"; break}
            case "wssr": {obj = client.waifus.ssrare; rarity = "Specially Super Rare"; break}
            case "wur": {obj = client.waifus.urare; rarity = "Ultra Rare"; break}
            case "hn": {obj = client.husbandos.normal; rarity = "Normal"; break}
            case "hr": {obj = client.husbandos.rare; rarity = "Rare"; break}
            case "hsr": {obj = client.husbandos.srare; rarity = "Super Rare"; break}
            case "hssr": {obj = client.husbandos.ssrare; rarity = "Specially Super Rare"; break}
            case "hur": {obj = client.husbandos.urare; rarity = "Ultra Rare"; break}
            default: {return message.reply("Invalid type!\nThe waifu ID should be `type.id_number` (for example, `wn.1`)!"); break}
        }
        if (!obj) return message.reply("Unable to access the database! Please try again later!");
        var waifu = obj[parseInt(id) - 1];
        if (!waifu) return message.reply("Invalid ID!\nThe waifu ID should be `type.id_number` (for example, `wn.1`)!");
        message.channel.send(new Discord.MessageEmbed()
        .setAuthor(waifu.name + " (" + waifu.anime + ")", message.author.avatarURL({size: 128, dynamic: true}))
        .setColor(Math.floor(Math.random() * 16777215))
        .addFields(
            {name: "Rarity:", value: rarity, inline: true},
            {name: "Base EXP:", value: waifu.base_exp, inline: true},
            {name: "Base HP:", value: waifu.base_hp, inline: true},
            {name: "Base ATK:", value: waifu.base_atk, inline: true},
            {name: "Base DEF:", value: waifu.base_def, inline: true}
        )
        .setImage(waifu.image_url));
    }
    catch (err) {
        console.error(err);
        return message.reply("An unexpected error occurred.");
    }
}

module.exports.config = {
    name: "dex",
    description: "View the information of a waifu/husbando in the database",
    usage: require("../config.json").prefix + "dex <id>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}