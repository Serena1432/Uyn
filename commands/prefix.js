/*
------------------------------------------------------------
   Richter BOT v1.0.0 - Custom Prefix Settings
   Developed by LilShieru a.k.a Nico Levianth
   https://github.com/LilShieru
------------------------------------------------------------
*/

const request = require("request");

module.exports.config = {
    name: "prefix",
    description: "View/set the BOT's prefix on this server",
    usage: require("../config.json").prefix + "prefix [prefix]",
    accessableby: "Members",
    category: "👋 Config",
	dmAvailable: false
}

module.exports.run = async (client, message, args, language) => {
    // If no prefix was sent, return server's current prefix
    if (!args[0]) if (client.customPrefixes[message.guild.id]) return message.reply("The BOT's current prefix on this server is `" + client.customPrefixes[message.guild.id] + "`."); else return message.reply("The BOT's current prefix on this server is `r!`.");
    // Checking for permissions
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.reply("You need the Manage Guild permission to do this!");
	// Check the current prefix
	if (client.customPrefixes[message.guild.id] && client.customPrefixes[message.guild.id] == args[0]) return message.reply("The BOT's prefix on this server is already `" + args[0] + "`!");
    // Connecting to the server
    request(process.env.php_server_url + '/SetCustomPrefix.php?token=' + process.env.php_server_token + '&id=' + message.guild.id + "&prefix=" + encodeURIComponent(args[0]), function(err, response, body) {
        if (!response || response.statusCode != 200 || body.includes('Connection failed')) {
            console.log(err);
            console.log(body);
            message.channel.send("Failed to connect to the server! Please try again later!");
        } else {
            if (body && body.includes('Success')) {
                request(process.env.php_server_url + '/GetCustomPrefixes.php', function(error, response, body) {
                    if (response && response.statusCode == 200) {
                        // Refreshing the prefixes list
                        client.customPrefixes = JSON.parse(body);
                        message.reply("Successfully set the BOT's prefix on this server into `" + args[0] + "`.");
                    }
                });
            } else {
                message.reply("An error has occurred, please try again later.");
            }
        }
    });
}
