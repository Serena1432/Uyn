const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args, language) => {
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    try {
        if (!args[0]) return message.reply(language.noWaifuID);
        if (!args[0].includes(".")) return message.reply(language.invalidDexID);
        var type = args[0].split(".")[0], id = args[0].split(".")[1];
        if (!id) return message.reply(language.invalidDexID);
        if (isNaN(id)) return message.reply(language.invalidDexID);
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
            default: {return message.reply(language.invalidDexID); break}
        }
        if (!obj) return message.reply(language.databaseError);
        var waifu = obj[parseInt(id) - 1];
        if (!waifu) return message.reply(language.invalidDexID);
        message.channel.send(new Discord.MessageEmbed()
        .setAuthor(waifu.name + " (" + waifu.anime + ")", message.author.avatarURL({size: 128, dynamic: true}))
        .setColor(Math.floor(Math.random() * 16777215))
        .addFields(
            {name: language.rarity, value: rarity, inline: true},
            {name: language.baseEXP, value: waifu.base_exp, inline: true},
            {name: language.baseHP, value: waifu.base_hp, inline: true},
            {name: language.baseATK, value: waifu.base_atk, inline: true},
            {name: language.baseDEF, value: waifu.base_def, inline: true}
        )
        .setImage(waifu.image_url));
    }
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
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