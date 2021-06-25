const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");

module.exports.run = async (client, message, args) => {
    try {
        if (!args[0]) return message.reply("Please type a search query or an anime MAL ID!");
        if (isNaN(args[0])) {
            var query = args.join(" ");
            request("https://api.jikan.moe/v3/search/anime?q=" + encodeURIComponent(query), function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    var descText = "";
                    for (var i = 0; i < 20; i++) {
                        var anime = data.results[i];
                        if (anime) descText += "`" + anime.mal_id + "` **" + anime.title + "**\n";
                    }
                    descText += "\nThis message only shows 20 first results. To reduce the search results please search using the full name.\nUse the `anime <id>` command with the ID next to the name to view the information of an anime.";
                    message.channel.send(new Discord.MessageEmbed()
                    .setAuthor("MyAnimeList", "https://image.myanimelist.net/ui/OK6W_koKDTOqqqLDbIoPAiC8a86sHufn_jOI-JGtoCQ")
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setTitle("\"" + query + "\" anime search results")
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
            request("https://api.jikan.moe/v3/anime/" + args[0], function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    message.channel.send(new Discord.MessageEmbed()
                    .setAuthor("MyAnimeList", "https://image.myanimelist.net/ui/OK6W_koKDTOqqqLDbIoPAiC8a86sHufn_jOI-JGtoCQ", data.url)
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setTitle(data.title)
                    .addFields(
                        {name: "Type:", value: data.type || "Unknown", inline: true},
                        {name: "Source:", value: data.source || "Unknown", inline: true},
                        {name: "Episodes:", value: data.episodes || "Unknown", inline: true},
                        {name: "Status:", value: data.status || "Unknown", inline: true},
                        {name: "Aired duration:", value: data.aired.string || "Unknown", inline: true},
                        {name: "Rating:", value: data.rating || "Unknown", inline: true},
                        {name: "Duration:", value: data.duration || "Unknown", inline: true},
                        {name: "Score:", value: data.score || "Unknown", inline: true},
                        {name: "Favorites:", value: data.favorites.toLocaleString() || "Unknown", inline: true},
                        {name: "Synopsis:", value: data.synopsis ? (data.synopsis.length > 512 ? (data.synopsis.substr(0, 509) + "...") : data.synopsis) : "Unknown", inline: false}
                    )
                    .setImage(data.image_url)
                    .setFooter("API powered by Jikan & MyAnimeList")
                    .setTimestamp());
                }
                else if (response.statusCode == 404) return message.reply("Cannot find this anime ID! Please type the other one!");
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
    name: "anime",
    description: "Get an anime information",
    usage: require("../config.json").prefix + "anime <id/name>",
    accessableby: "Members",
    aliases: [],
    category: "📺 Anime/Manga",
    dmAvailable: true
}