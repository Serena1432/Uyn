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
        if (!args[0]) return message.reply("Please type a waifu name!");
        var name = args.join(" ");
        var desc = "", length = 0;
        for (var i = 0; i < client.waifus.normal.length; i++) if (client.waifus.normal[i].name.includes(name) && length < 20) {  desc += "`wn." + (i + 1) + "` **" + client.waifus.normal[i].name + "**\n"; length++ }
        for (var i = 0; i < client.waifus.rare.length; i++) if (client.waifus.rare[i].name.includes(name) && length < 20) {  desc += "`wr." + (i + 1) + "` **" + client.waifus.rare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.waifus.srare.length; i++) if (client.waifus.srare[i].name.includes(name) && length < 20) {  desc += "`wsr." + (i + 1) + "` **" + client.waifus.srare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.waifus.ssrare.length; i++) if (client.waifus.ssrare[i].name.includes(name) && length < 20) {  desc += "`wssr." + (i + 1) + "` **" + client.waifus.ssrare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.waifus.urare.length; i++) if (client.waifus.urare[i].name.includes(name) && length < 20) {  desc += "`wur." + (i + 1) + "` **" + client.waifus.urare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.husbandos.normal.length; i++) if (client.husbandos.normal[i].name.includes(name) && length < 20) {  desc += "`hn." + (i + 1) + "` **" + client.husbandos.normal[i].name + "**\n"; length++ }
        for (var i = 0; i < client.husbandos.rare.length; i++) if (client.husbandos.rare[i].name.includes(name) && length < 20) {  desc += "`hr." + (i + 1) + "` **" + client.husbandos.rare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.husbandos.srare.length; i++) if (client.husbandos.srare[i].name.includes(name) && length < 20) {  desc += "`hsr." + (i + 1) + "` **" + client.husbandos.srare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.husbandos.ssrare.length; i++) if (client.husbandos.ssrare[i].name.includes(name) && length < 20) {  desc += "`hssr." + (i + 1) + "` **" + client.husbandos.ssrare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.husbandos.urare.length; i++) if (client.husbandos.urare[i].name.includes(name) && length < 20) {  desc += "`hur." + (i + 1) + "` **" + client.husbandos.urare[i].name + "**\n"; length++ }
        desc += "\nThis message only shows 20 first results. To reduce the search results please search using the full name.\nUse the `dex <id>` command with the ID next to the name to view the information of a waifu/husbando.";
        message.channel.send(new Discord.MessageEmbed()
        .setAuthor("List of the waifus/husbando that contain the \"" + name + "\" name", client.user.avatarURL({size: 128}))
        .setDescription(desc)
        .setColor(Math.floor(Math.random * 16777215))
        .setTimestamp());
    }
    catch (err) {
        console.error(err);
        return message.reply("An unexpected error occurred.");
    }
}

module.exports.config = {
    name: "search",
    description: "Search for waifus/husbandos in the database",
    usage: require("../config.json").prefix + "search <name>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}