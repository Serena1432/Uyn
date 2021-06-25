const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");

module.exports.run = async (client, message, args) => {
    try {
        if (!args[0]) return message.reply("Please type a search query or an character MAL ID!");
        if (isNaN(args[0])) {
            var query = args.join(" ");
            request("https://api.jikan.moe/v3/search/character?q=" + encodeURIComponent(query), function(error, response, body) { 
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    var descText = "";
                    for (var i = 0; i < 20; i++) {
                        var character = data.results[i];
                        if (character) descText += "`" + character.mal_id + "` **" + character.name + "**\n";
                    }
                    descText += "\nThis message only shows 20 first results. To reduce the search results please search using the full name.\nUse the `character <id>` command with the ID next to the name to view the information of an character.";
                    message.channel.send(new Discord.MessageEmbed()
                    .setAuthor("MyAnimeList", "https://image.myanimelist.net/ui/OK6W_koKDTOqqqLDbIoPAiC8a86sHufn_jOI-JGtoCQ")
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setTitle("\"" + query + "\" character search results")
                    .setDescription(descText)
                    .setFooter("API powered by Jikan & MyAnimeList")
                    .setTimestamp());
                }
                else if (response.statusCode == 404) return message.reply("No search results found.");
                else {
                    console.error(error);
                    return message.reply("Cannot connect to the API!");
                }
            });
        }
        else {
            request("https://api.jikan.moe/v3/character/" + args[0], function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    var anime = "", manga = "", va = "";
                    for (var i = 0; i < data.animeography.length; i++) {
                        var a = data.animeography[i];
                        anime += "[" + a.name + "](" + a.url + ") (" + a.role + ")\n";
                    }
                    for (var i = 0; i < data.mangaography.length; i++) {
                        var a = data.mangaography[i];
                        manga += "[" + a.name + "](" + a.url + ") (" + a.role + ")\n";
                    }
                    for (var i = 0; i < data.voice_actors.length; i++) {
                        var a = data.voice_actors[i];
                        va += "[" + a.name + "](" + a.url + ") (" + a.language + ")\n";
                    }
                    message.channel.send(new Discord.MessageEmbed()
                    .setAuthor("MyAnimeList", "https://image.myanimelist.net/ui/OK6W_koKDTOqqqLDbIoPAiC8a86sHufn_jOI-JGtoCQ", data.url)
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setTitle(data.name)
                    .addFields(
                        {name: "Kanji name:", value: data.name_kanji || "Unknown", inline: true},
                        {name: "Nicknames:", value: data.nicknames.join(", ") || "None", inline: true},
                        {name: "Anime:", value: anime || "None", inline: true},
                        {name: "Manga:", value: manga || "None", inline: true},
                        {name: "Voice actors:", value: va || "None", inline: true},
                        {name: "Favorites:", value: data.member_favorites.toLocaleString() || "Unknown", inline: true},
                        {name: "About:", value: data.about ? (data.about.length > 512 ? (data.about.substr(0, 509) + "...") : data.about) : "Unknown", inline: false}
                    )
                    .setImage(data.image_url)
                    .setFooter("API powered by Jikan & MyAnimeList")
                    .setTimestamp());
                }
                else if (response.statusCode == 404) return message.reply("Cannot find this character ID! Please type the other one!");
                else {
                    console.error(error);
                    return message.reply("Cannot connect to the API!");
                }
            });
        }
    }
    catch (err) {
        console.error(err);
        return message.reply("An error has occurred.");
    }
}

module.exports.config = {
    name: "character",
    description: "Get an character information",
    usage: require("../config.json").prefix + "character <id/name>",
    accessableby: "Members",
    aliases: [],
    category: "📺 Anime/Manga",
    dmAvailable: true
}