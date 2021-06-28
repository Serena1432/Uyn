const request = require("request");
const fs = require("fs");
const Discord = require("discord.js");

module.exports.config = {
    name: "language",
    description: "View/set the BOT's language on this server",
    usage: require("../config.json").prefix + "language [language]",
    accessableby: "Members",
    category: "👋 Config",
	dmAvailable: false
}

module.exports.run = async (client, message, args, language) => {
    if (!args[0]) return message.reply(language.currentLanguage.replace("$lang", client.languages[message.guild.id] || "English"));
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.reply(language.needManageGuildPermission);
	if (client.languages[message.guild.id] && client.languages[message.guild.id] == args[0].toLowerCase()) return message.reply(language.languageAlready);
    try {
        if (!fs.existsSync("./languages/" + args[0].toLowerCase() + ".json")) return message.reply("This language isn't supported yet!");
        language = require("../languages/" + args[0].toLowerCase() + ".json");
        request(process.env.php_server_url + '/SetLanguage.php?token=' + process.env.php_server_token + '&id=' + message.guild.id + "&language=" + encodeURIComponent(args[0].toLowerCase()), function(err, response, body) {
            if (!response || response.statusCode != 200 || body.includes('Connection failed')) {
                console.log(err);
                console.log(body);
                message.channel.send(language.serverConnectionError);
            } else {
                if (body && body.includes('Success')) {
                    request(process.env.php_server_url + '/GetLanguages.php', function(error, response, body) {
                        if (response && response.statusCode == 200) {
                            client.languages = JSON.parse(body);
                            if (!language.information.notice) message.reply(language.languageSet.replace("$author", language.information.author ? (client.users.cache.get(language.information.author) ? client.users.cache.get(language.information.author).tag : "an unknown person") : "an unknown person"));
                            else message.reply(language.languageSet.replace("$author", language.information.author ? (client.users.cache.get(language.information.author) ? client.users.cache.get(language.information.author).tag : "an unknown person") : "an unknown person"), new Discord.MessageEmbed()
                            .setDescription(language.information.notice)
                            .setColor(Math.floor(Math.random() * 16777215)));
                        }
                    });
                } else {
                    message.reply(language.serverConnectionError);
                }
            }
        });
    }
    catch (err) {
        console.error(err);
        message.channel.send("Cannot get the language information! Please contact the developer/translator and try again!")
    }
}
