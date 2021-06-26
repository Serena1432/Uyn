const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");
const Discord = require("discord.js");

module.exports = async (client, message) => {
    // Ignore all bots
    if (message.author.bot) return;
	
	client.sentMessages++;
	
	// Ping-responsing part
	var today = new Date();
    var enabled = 0;
    if (message.channel.type == "text") {
        if (client.economyManager[message.author.id] && !client.messageCountdown[message.author.id] || client.messageCountdown[message.author.id] < 5 && !message.channel.name.toLowerCase().includes("bot")) {
            try {
                if (!client.economyManager[message.author.id].messagePoints) client.economyManager[message.author.id].messagePoints = encrypt("0");
                var messagePoints = decrypt(client.economyManager[message.author.id].messagePoints);
                messagePoints++;
                client.economyManager[message.author.id].messagePoints = encrypt(messagePoints.toString());
                if (client.messageCountdown[message.author.id] == undefined) client.messageCountdown[message.author.id] = 0;
                var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                coins += 5;
                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                if (client.economyManager[message.author.id].waifus) {
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        var waifu = client.economyManager[message.author.id].waifus[i], exp = 5;
                        if (!waifu.id) {
                            if (client.economyManager[message.author.id].waifus.length > 1 && client.economyManager[message.author.id].waifus[i - 1].id) waifu.id = client.economyManager[message.author.id].waifus[i - 1].id + 1;
                            else waifu.id = 1;
                        }
                        while (exp > 0) {
                            if (parseInt(waifu.max_exp) - waifu.exp > exp) {
                                waifu.exp += exp;
                                exp = 0;
                            }
                            else {
                                exp -= parseInt(waifu.max_exp) - waifu.exp;
                                waifu.level++;
                                waifu.exp = 0;
                                waifu.max_exp = parseInt(waifu.base_exp * (1 + 0.15 * (waifu.level - 1)));
                            }
                        }
                    }
                }
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "update",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        let result = "";
                        for (let i = 0; i < 32; i++) {
                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**ID:** " + result, new Discord.MessageEmbed()
                            .setColor(Math.floor(Math.random() * 16777215))
                            .setAuthor(message.author.username + " has just rewarded 5 " + client.config.currency + " and 1 Message Point because of chatting.", message.author.avatarURL({size: 128}))
                            .setTimestamp()
                        );
                        else console.log("Cannot get the log channel.");
                    }
                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                });
                client.messageCountdown[message.author.id]++;
                if (client.messageCountdown[message.author.id] >= 5) {
                  setTimeout(function() {
                    client.messageCountdown[message.author.id] = 0;
                  }, 300000);
                }
            }
            catch (err) {
                console.error(err);
            }
        }
        if (client.toggleQuote[message.guild.id] == undefined || client.toggleQuote[message.guild.id] == 1) enabled = 1;
        if (message.mentions.users.size == 1 && message.content.length < 125 && client.quotes[message.mentions.users.first().id] && !message.author.bot && today.getHours() != 20 && today.getHours() != 21 && today.getHours() != 22 && today.getHours() != 23 && !message.channel.name.includes('bot') && enabled) {
            if (!client.floodchat[message.mentions.users.first().id]) {
                client.users.fetch(message.mentions.users.first().id).then((user) => {
                    const mess = {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        description: client.quotes[message.mentions.users.first().id],
                        footer: {
                            text: user.tag,
                            icon_url: user.avatarURL({
                                format: "png",
                                dynamic: true,
                                size: 2048
                            })
                        }
                    };
                    message.channel.send({
                        embed: mess
                    }).then(msg => {
                        msg.delete({
                            timeout: 5000
                        })
                    });
                });
                client.floodchat[message.mentions.users.first().id] = true;
                var fbQuote = setInterval(function() {
                    if (client.floodchat[message.mentions.users.first().id]) {
                        client.floodchat[message.mentions.users.first().id] = null;
                        clearInterval(fbQuote);
                    }
                }, 60000);
            } else {
                message.react('❌').then(react => setTimeout(function() {
                    react.remove();
                }, 2000));
            }
        }
    }

    // Assign the current prefix first
    var prefix = client.config.prefix, language = require("../languages/english.json");
    // Detect if it was a Guild Chat, if yes, go to the Custom Prefixes part
    if (message.channel.type == "text") {
        if (client.addRole[message.author.id] && client.addRole[message.author.id].channel == message.channel.id) {
            try {
                if (message.content == "cancel") {
                    client.addRole[message.author.id] = undefined;
                    return message.reply(language.roleAddingRequestCanncelled);
                }
                else if (!client.addRole[message.author.id].role) {
                    var role;
                    if (message.mentions.roles.size > 0) role = message.mentions.roles.first();
                    else if (message.mentions.roles.size == 0 && !isNaN(message.content)) role = message.guild.roles.cache.get(message.content);
					else role = message.guild.roles.cache.find(r => r.name == message.content);
                    if (!role) return message.reply(language.roleNotFound);
                    if (client.economyManager[message.guild.id]) {
                        for (var i = 0; i < client.economyManager[message.guild.id].roles.length; i++) {
                            if (client.economyManager[message.guild.id].roles[i].id == role.id) return message.reply(language.serverRoleAlreadyExist);
                        }
                    }
                    if (role.position >= message.guild.member(client.user).roles.highest.position) return message.reply(language.botRoleLowerPosition);
                    client.addRole[message.author.id].role = role.id;
                    return message.reply(language.serverRoleDescription.replace("$role.name", role.name));
                }
                else if (!client.addRole[message.author.id].description) {
                    client.addRole[message.author.id].description = message.content;
                    return message.reply(language.serverRolePrice.replace("$content", message.content)).replace("$currency", client.config.currency)
                }
                else if (!client.addRole[message.author.id].price) {
                    if (isNaN(message.content)) return message.reply(language.priceisNaN);
                    client.addRole[message.author.id].price = parseInt(message.content);
                    client.addRole[message.author.id].confirmation = true;
                    return message.reply(language.serverRoleIsSet.replace("$content", message.content).replace("$currency", client.config.currency));
                }
                else if (client.addRole[message.author.id].confirmation) {
                    switch (message.content.toLowerCase()) {
                        case "no": {
                            client.addRole[message.author.id] = {
                                channel: message.channel.id
                            };
                            message.channel.send(language.serverRoleReset);
                            break;
                        }
                        case "yes": {
                            var type = "update";
                            if (!client.economyManager[message.guild.id]) {
                                client.economyManager[message.guild.id] = {
                                    roles: []
                                };
                                type = "add";
                            }
                            var length = client.economyManager[message.guild.id].roles.length;
                            client.economyManager[message.guild.id].roles.push({
                                id: client.addRole[message.author.id].role,
                                description: client.addRole[message.author.id].description,
                                price: client.addRole[message.author.id].price,
                            });
                            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                type: type,
                                token: process.env.php_server_token,
                                id: message.guild.id,
                                data: JSON.stringify(client.economyManager[message.guild.id])
                            }}, function(error, response, body) {
                                if (!error && response.statusCode == 200 && body.includes("Success")) {
                                    var role = message.guild.roles.cache.get(client.addRole[message.author.id].role);
                                    const exampleEmbed = new Discord.MessageEmbed()
                                    .setColor(role.hexColor)
                                    .setAuthor(language.serverRoleAdded.replace("$role.name", role.name), message.guild.iconURL({size: 128}))
                                    .addFields(
                                        { name: language.descriptionEmbedField, value: client.addRole[message.author.id].description},
                                        { name: language.priceEmbedField, value: client.addRole[message.author.id].price.toString() + " " + client.config.currency + ""},
                                    )
                                    .setTimestamp()
                                    .setFooter(client.devUsername, client.user.avatarURL({size: 128}));
                                    message.channel.send(exampleEmbed);
                                    client.addRole[message.author.id] = undefined;
                                }
                                else {
                                    client.economyManager[message.author.id].roles.splice(length, 1);
                                    client.addRole[message.author.id] = undefined;
                                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                }
                            });
                            break;
                        }
                        default: {
                            return message.reply(language.invalidAnswer);
                            break;
                        }
                    }
                }
            }
            catch (err) {
                client.addRole[message.author.id] = undefined;
                console.error(err);
                return message.reply(language.unexpectedErrorOccurred);
            }
        }
        // If the client.customPrefixes was null, refresh it
        if (!client.customPrefixes) {
            request(process.env.php_server_url + '/GetCustomPrefixes.php', function(error, response, body) {
                if (response && response.statusCode == 200 && !body.includes("Connection failed")) {
                    // Refreshing the prefixes list
                    client.customPrefixes = JSON.parse(body);
                    // Go to the Custom Prefix part
                    CustomPrefix();
                }
            });
        }
        else CustomPrefix();
    }
    
    // Custom Prefix part
    function CustomPrefix() {
        // Check if the server has a prefix, if yes, assign it as the current prefix
        if (client.customPrefixes[message.guild.id]) prefix = client.customPrefixes[message.guild.id];
    }
    
    // Done the Custom Prefix part.
   
    if (message.mentions.users.size)
    if (message.mentions.users.first().id == client.user.id) message.channel.send("The BOT's prefix in this server is " + prefix + ".").then(message => {
        message.delete({timeout:5000});
    });
  
    // Ignore messages not starting with the prefix
    if (message.content.toLowerCase().indexOf(prefix) !== 0) return;
    
    const args = message.content.substr(prefix.length).split(" ");
    var command = args[0];
    args.splice(0, 1);
  
    // Grab the command data from the client.commands Enmap
    const cmd = client.commands.get(command) || client.commands.find(c => c.aliases && c.aliases.includes(command));
  
    // If that command doesn't exist, silently exit and do nothing
    if (!cmd) return;
	
	client.botMessages++;
  
    // Run the command
	if (message.channel.type == "dm") {
		if (cmd.config.dmAvailable) cmd.run(client, message, args, language);
		else message.channel.send("This command cannot be executed in a Direct Messages channel!");
	}
	else {
		if (message.guild.member(client.user).hasPermission("SEND_MESSAGES")) {
			if (!message.channel.permissionOverwrites.get(client.user.id) || message.channel.permissionOverwrites.get(client.user.id).deny.has("SEND_MESSAGES") != true) 
				cmd.run(client, message, args, language);
			else message.author.send("I don't have permission to send messages on the **" + message.guild.name + "** server! Please contact the server admin to fix the issue!");
		}
		else message.author.send("I don't have permission to send messages on the **" + message.guild.name + "** server! Please contact the server admin to fix the issue!");
	}
};
