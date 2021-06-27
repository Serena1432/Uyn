const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {
    encrypt,
    decrypt
} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function inventory(client, message, args, language) {
    try {
        var items = require("../items.json");
        if (!client.economyManager[message.author.id].inventory) client.economyManager[message.author.id].inventory = [];
        if (client.economyManager[message.author.id].inventory.length == 0) return message.reply("You don't have anything in the inventory!");
        var n = 0;
        if (args[0]) n = parseInt(args[0]) - 1;
        var descText = "`------------------------------------------\n| Code  ";
        if (language.itemName.length <= 29) {
            descText += " | " + language.itemName;
            for (var j = 0; j < 29 - language.itemName.length; j++) descText += " ";
        }
        else descText += " | " + language.itemName.substr(0, 26) + "...";
		descText += " |\n------------------------------------------";
        if (n * 10 > client.economyManager[message.author.id].inventory.length - 1) return message.reply(language.noMoreInvItem);
        for (var i = n * 10; i < n * 10 + 10; i++) {
            if (client.economyManager[message.author.id].inventory[i]) {
				for (var j = 0; j < items.length; j++) {
					if (items[j].code == client.economyManager[message.author.id].inventory[i]) {
						var item = items[j];
						switch (item.type) {
							case "background": {
								var name = language.bannerImageItem.replace("$name", item.name);
								descText += "\n| " + item.code;
								for (var k = 0; k < 6 - item.code.length; k++) descText += " ";
								if (name.length <= 29) {
									descText += " | " + name;
									for (var k = 0; k < 29 - name.length; k++) descText += " ";
								}
								else descText += " | " + name.substr(0, 26) + "...";
								descText += " |";
								break;
							}
						}
						descText += "\n------------------------------------------";
					}
				}
            } else break;
        }
        descText += language.invInstructions;
        if ((n + 1) * 10 <= client.economyManager[message.author.id].inventory.length - 1) descText += language.invNextPage.replace("$page", n + 2);
        const embed = {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: language.inventory.replace("$name", message.author.username),
                icon_url: message.author.avatarURL({
                    size: 128
                })
            },
            description: descText,
            timestamp: new Date()
        };
        message.channel.send({
            embed: embed
        });
    }
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.run = async (client, message, args, language) => {
    try {
        if (client.economyManager[message.author.id]) {
            inventory(client, message, args, language);
            return;
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            inventory(client, message, args, language);
                            return;
                        }
                        else {
                                client.economyManager[message.author.id] = {
                                    coins: encrypt("500"),
                                    inventory: []
                                };
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: message.author.id,
                                    data: JSON.stringify(client.economyManager[message.author.id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        inventory(client, message, args, language);
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                });
                        }
                    }
                    catch (err) {
                        console.error(err);
                        return message.reply(language.unexpectedErrorOccurred);
                    }
                }
                else return message.reply(language.serverConnectError);
            });
        }
    }
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.config = {
    name: "inventory",
    description: "View your inventory",
    usage: require("../config.json").prefix + "inventory <page>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}