const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function info(client, message, args) {
    if (!client.countdown[message.author.id] || client.countdown[message.author.id] < (new Date()).getTime()) {
		if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
		if (!client.economyManager[message.author.id].team) client.economyManager[message.author.id].team = {
			name: "",
			members: []
		};
		try {
			var opponentTeam = {};
			if (!client.economyManager[message.author.id].team || client.economyManager[message.author.id].team.members.length == 0) return message.reply("You don't have any team!\nUse the `team add <waifu id>` command to add a member to your team!");
			var playerTeam = {
				name: client.economyManager[message.author.id].team.name != "" ? client.economyManager[message.author.id].team.name : (message.author.username + "'s team"),
				members: []
			};
			var maxLevel = 0;
			for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
				var waifu;
				for (var j = 0; j < client.economyManager[message.author.id].waifus.length; j++) {
					if (client.economyManager[message.author.id].waifus[j].id == client.economyManager[message.author.id].team.members[i]) {
						waifu = client.economyManager[message.author.id].waifus[j];
						break;
					}
				}
				maxLevel = Math.max(waifu.level, maxLevel);
			}
			if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < 50 * (2 + maxLevel * 0.35)) return message.reply("You need to have at least **" + (50 * (2 + maxLevel * 0.35)) + " " + client.config.currency + "** to start a battle!");
			for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
				var waifu;
				for (var j = 0; j < client.economyManager[message.author.id].waifus.length; j++) {
					if (client.economyManager[message.author.id].waifus[j].id == client.economyManager[message.author.id].team.members[i]) {
						waifu = client.economyManager[message.author.id].waifus[j];
						break;
					}
				}
				playerTeam.members.push({
					name: waifu.name,
					base_hp: waifu.base_hp,
					base_atk: waifu.base_atk,
					base_def: waifu.base_def,
					base_exp: waifu.base_exp,
					level: waifu.level,
					current_hp: parseInt(waifu.base_hp * (1 + 0.05 * waifu.level)),
					rarity: rarity
				});
			}
			if (!message.mentions.users.size) {
				opponentTeam.name = "opponent's Team";
				opponentTeam.members = [];
				for (var i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
					var random = Math.random(), waifu, length = client.economyManager[message.author.id].waifus.length, rarity, type;
					if (random < 0.8) {
						rarity = "Normal";
						if (Math.random() <= 0.5) {
							waifu = client.waifus.normal[Math.floor(Math.random() * client.waifus.normal.length)];
							type = "Waifu";
						}
						else {
							waifu = client.husbandos.normal[Math.floor(Math.random() * client.husbandos.normal.length)];
							type = "Husbando";
						}
					}
					else if (random >= 0.8 && random < 0.9) {
						rarity = "Rare";
						if (Math.random() <= 0.5) {
							waifu = client.waifus.rare[Math.floor(Math.random() * client.waifus.rare.length)];
							type = "Waifu";
						}
						else {
							waifu = client.husbandos.rare[Math.floor(Math.random() * client.husbandos.rare.length)];
							type = "Husbando";
						}
					}
					else if (random >= 0.9 && random < 0.95) {
						rarity = "Super Rare";
						if (Math.random() <= 0.5) {
							waifu = client.waifus.srare[Math.floor(Math.random() * client.waifus.srare.length)];
							type = "Waifu";
						}
						else {
							waifu = client.husbandos.srare[Math.floor(Math.random() * client.husbandos.srare.length)];
							type = "Husbando";
						}
					}
					else if (random >= 0.95 && random < 0.98) {
						waifu = client.waifus.ssrare[Math.floor(Math.random() * client.waifus.ssrare.length)];
						rarity = "Specially Super Rare";
						type = "Waifu";
					}
					else {
						waifu = client.waifus.urare[Math.floor(Math.random() * client.waifus.urare.length)];
						rarity = "Ultra Rare";
						type = "Waifu";
					}
					var level = Math.floor(Math.random() * parseInt(maxLevel / 4)) + maxLevel - parseInt(maxLevel / 8);
					opponentTeam.members.push({
						name: waifu.name,
						base_hp: waifu.base_hp,
						base_atk: waifu.base_atk,
						base_def: waifu.base_def,
						base_exp: waifu.base_exp,
						level: level,
						current_hp: parseInt(waifu.base_hp * (1 + 0.05 * level)),
						rarity: rarity
					});
					console.log(opponentTeam.members[opponentTeam.members.length - 1]);
				}
			}
			else {
				if (message.mentions.users.first().bot) return message.reply("You cannot battle with a BOT!");
				if (message.mentions.users.first().id == message.author.id) return message.reply("You cannot battle with yourself!");
				if (!client.economyManager[message.mentions.users.first().id].team || client.economyManager[message.mentions.users.first().id].team.members.length == 0) return message.reply("The mentioned user doesn't have any team!")
				var opponentTeam = {
					name: client.economyManager[message.mentions.users.first().id].team.name != "" ? client.economyManager[message.mentions.users.first().id].team.name : (message.mentions.users.first().username + "'s team"),
					members: []
				};
				for (var i = 0; i < client.economyManager[message.mentions.users.first().id].team.members.length; i++) {
					var waifu;
					for (var j = 0; j < client.economyManager[message.mentions.users.first().id].waifus.length; j++) {
						if (client.economyManager[message.mentions.users.first().id].waifus[j].id == client.economyManager[message.mentions.users.first().id].team.members[i]) {
							waifu = client.economyManager[message.mentions.users.first().id].waifus[j];
							break;
						}
					}
					opponentTeam.members.push({
						name: waifu.name,
						base_hp: waifu.base_hp,
						base_atk: waifu.base_atk,
						base_def: waifu.base_def,
						base_exp: waifu.base_exp,
						level: waifu.level,
						current_hp: parseInt(waifu.base_hp * (1 + 0.05 * waifu.level)),
						rarity: rarity
					});
				}
			}
			maxLevel = 0;
			client.countdown[message.author.id] = (new Date()).getTime() + 15000;
			for (var i = 0; i < opponentTeam.members.length; i++) {
				var waifu = opponentTeam.members[i];
				maxLevel = Math.max(waifu.level, maxLevel);
			}
			var playerTeamText = "", opponentTeamText = "";
			for (var i = 0; i < playerTeam.members.length; i++) {
				playerTeamText += "**" + playerTeam.members[i].name + "** (Lv." + playerTeam.members[i].level + ")\n**HP:** " + playerTeam.members[i].current_hp.toLocaleString() + "/" + parseInt(playerTeam.members[i].base_hp * (1 + 0.05 * playerTeam.members[i].level)).toLocaleString() + "\n\n";
			}
			for (var i = 0; i < opponentTeam.members.length; i++) {
				opponentTeamText += "**" + opponentTeam.members[i].name + "** (Lv." + opponentTeam.members[i].level + ")\n**HP:** " + opponentTeam.members[i].current_hp.toLocaleString() + "/" + parseInt(opponentTeam.members[i].base_hp * (1 + 0.05 * opponentTeam.members[i].level)).toLocaleString() + "\n\n";
			}
			var embed = new Discord.MessageEmbed()
			.setAuthor(message.author.username + "'s battle against " + (message.mentions.users.size ? message.mentions.users.first().username : "a random opponent"), message.author.avatarURL({size: 128, dynamic: true}))
			.setDescription("If the BOT doesn't update the battle status for a long time, that means the BOT has been restarted during the battle.\nAt that time, please use the command again.")
			.addFields({name: playerTeam.name, value: playerTeamText, inline: true}, {name: opponentTeam.name, value: opponentTeamText, inline: true})
			.setTimestamp(), end = false;
			message.channel.send(embed).then(msg => {
				var interval = setInterval(function() {
					for (var i = 0; i < opponentTeam.members.length; i++) {
						var player, playerIndex, playerMinDef = 9999, opponent = opponentTeam.members[i];
						if (!opponent.utb) {
							for (var j = 0; j < playerTeam.members.length; j++) {
								if (!playerTeam.members[j].utb && playerTeam.members[j].base_def < playerMinDef) {
									playerIndex = j;
									playerMinDef = playerTeam.members[j].base_def;
								}
							}
							player = playerTeam.members[playerIndex];
							var damage = (Math.floor(Math.random() * 10) + parseInt(opponent.base_atk * (1 + 0.075 * opponent.level)) - parseInt(player.base_def * (1 + 0.085 * player.level)) - 5) * 10;
							if (damage <= 0) damage = Math.floor(Math.random() * 10) + 1;
							if (damage < player.current_hp) player.current_hp -= damage;
							else {
								player.current_hp = 0;
								player.utb = true;
							}
						}
					}
					for (var i = 0; i < playerTeam.members.length; i++) {
						var opponent, opponentIndex, opponentMinDef = 9999, player = playerTeam.members[i];
						if (!player.utb) {
							for (var j = 0; j < opponentTeam.members.length; j++) {
								if (!opponentTeam.members[j].utb && opponentTeam.members[j].base_def < opponentMinDef) {
									opponentIndex = j;
									opponentMinDef = opponentTeam.members[j].base_def;
								}
							}
							opponent = opponentTeam.members[opponentIndex];
							var damage = (Math.floor(Math.random() * 10) + parseInt(player.base_atk * (1 + 0.075 * player.level)) - parseInt(opponent.base_def * (1 + 0.085 * opponent.level)) - 5) * 10;
							if (damage <= 0) damage = Math.floor(Math.random() * 10) + 1;
							if (damage < opponent.current_hp) opponent.current_hp -= damage;
							else {
								opponent.current_hp = 0;
								opponent.utb = true;
							}
						}
					}
					var playerTeamText = "", opponentTeamText = "", playerUtb = 0, opponentUtb = 0;
					for (var i = 0; i < playerTeam.members.length; i++) {
						if (playerTeam.members[i].current_hp == 0) playerUtb++;
						playerTeamText += "**" + playerTeam.members[i].name + "** (Lv." + playerTeam.members[i].level + ")\n**HP:** " + playerTeam.members[i].current_hp.toLocaleString() + "/" + parseInt(playerTeam.members[i].base_hp * (1 + 0.05 * playerTeam.members[i].level)).toLocaleString() + "\n\n";
					}
					for (var i = 0; i < opponentTeam.members.length; i++) {
						if (opponentTeam.members[i].current_hp == 0) opponentUtb++;
						opponentTeamText += "**" + opponentTeam.members[i].name + "** (Lv." + opponentTeam.members[i].level + ")\n**HP:** " + opponentTeam.members[i].current_hp.toLocaleString() + "/" + parseInt(opponentTeam.members[i].base_hp * (1 + 0.05 * opponentTeam.members[i].level)).toLocaleString() + "\n\n";
					}
					var res = "battling";
					embed = new Discord.MessageEmbed()
					.setAuthor(message.author.username + "'s battle against " + (message.mentions.users.size ? message.mentions.users.first().username : "a random opponent"), message.author.avatarURL({size: 128, dynamic: true}))
					.setDescription("If the BOT doesn't update the battle status for a long time, that means the BOT has been restarted during the battle.\nAt that time, please use the command again.")
					.addFields({name: playerTeam.name, value: playerTeamText, inline: true}, {name: opponentTeam.name, value: opponentTeamText, inline: true})
					.setTimestamp();
					if (playerUtb == playerTeam.members.length && opponentUtb == opponentTeam.members.length) {
						res = "draw";
						end = true;
						embed.setFooter("The result is a draw!");
						clearInterval(interval);
					}
					else if (playerUtb == playerTeam.members.length) {
						res = "lose";
						end = true;
						embed.setFooter((message.mentions.users.size ? message.mentions.users.first().username : "The opponent") + " is the winner!\nYou lost " + parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length) + " " + client.config.currency + (message.mentions.users.size ? (" and " + message.mentions.users.first().username + " got " + parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length) + " " + client.config.currency + " and " + parseInt((2 + maxLevel * 0.6) *  opponentTeam.members.length) + " EXP...") : ""));
						clearInterval(interval);
					}
					else if (opponentUtb == opponentTeam.members.length) {
						res = "win";
						end = true;
						embed.setFooter("You are the winner! Congratulations!\nYou got " + parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length) + " " + client.config.currency + " and your team got " + parseInt((2 + maxLevel * 0.6) *  opponentTeam.members.length) + " EXP!\n" + (message.mentions.users.size ? (message.mentions.users.first().username + " has lost " + parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length) + " " + client.config.currency + "!") : ""));
						clearInterval(interval);
					}
					if (!end && opponentUtb != opponentTeam.members.length || res == "draw") msg.edit(embed);
					else {
						var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
						if (res == "win") coins += parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length);
						else coins -= parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length);
						client.economyManager[message.author.id].coins = encrypt(coins.toString());
						if (res == "win") {
							var rExp = parseInt((2 + maxLevel * 0.6) *  opponentTeam.members.length);
							for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
								var waifu;
								for (var j = 0; j < client.economyManager[message.author.id].waifus.length; j++) {
									if (client.economyManager[message.author.id].waifus[j].id == client.economyManager[message.author.id].team.members[i]) {
										waifu = client.economyManager[message.author.id].waifus[j];
										break;
									}
								}
								var exp = rExp;
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
								if (message.mentions.users.size) {
									if (res == "lose") {
										var rExp = parseInt((2 + maxLevel * 0.6) *  opponentTeam.members.length);
										for (var i = 0; i < client.economyManager[message.mentions.users.first().id].team.members.length; i++) {
											var waifu;
											for (var j = 0; j < client.economyManager[message.mentions.users.first().id].waifus.length; j++) {
												if (client.economyManager[message.mentions.users.first().id].waifus[j].id == client.economyManager[message.mentions.users.first().id].team.members[i]) {
													waifu = client.economyManager[message.mentions.users.first().id].waifus[j];
													break;
												}
											}
											var exp = rExp;
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
									var coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
									if (res == "win") {
										if (parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length) < coins) coins -= parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length);
										else coins = 0;
									}
									else coins += parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length);
									client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
									request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
										type: "update",
										token: process.env.php_server_token,
										id: message.mentions.users.first().id,
										data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
									}}, function(error, response, body) {
										if (!error && response.statusCode == 200 && body.includes("Success")) {
											const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
											let result = "";
											for (let i = 0; i < 32; i++) {
												result += characters.charAt(Math.floor(Math.random() * characters.length));
											}
											if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**ID:** " + result, new Discord.MessageEmbed()
												.setColor(Math.floor(Math.random() * 16777215))
												.setAuthor(message.mentions.users.first().username + " has just " + (res == "lose" ? "won" : "lost") + " " + parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length) + " because of " + (res == "lose" ? "winning" : "losing") + " a battle.", message.mentions.users.first().avatarURL({size: 128}))
												.setTimestamp()
											);
											else console.log("Cannot get the log channel.");
											msg.edit(embed);
										}
										else {
											console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
											return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
										}
									});
								}
								else {
									const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
									let result = "";
									for (let i = 0; i < 32; i++) {
										result += characters.charAt(Math.floor(Math.random() * characters.length));
									}
									if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**ID:** " + result, new Discord.MessageEmbed()
										.setColor(Math.floor(Math.random() * 16777215))
										.setAuthor(message.author.username + " has just " + (res == "win" ? "won" : "lost") + " " + parseInt(15 *  (2 + maxLevel * 0.35) *  opponentTeam.members.length) + " because of winning a battle.", message.author.avatarURL({size: 128}))
										.setTimestamp()
									);
									else console.log("Cannot get the log channel.");
									msg.edit(embed);
								}
							}
							else {
								console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
								return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
							}
						});
					}
				}, 2500);
			})
		}
		catch (err) {
			console.error(err);
			return message.reply("An unexpected error occurred.");
		}
	} else {
        var totalSeconds = (client.countdown[message.author.id] - (new Date()).getTime()) / 1000;
        var days = parseInt(totalSeconds / 86400);
        var hours = parseInt((totalSeconds - days * 86400) / 3600);
        var minutes = parseInt((totalSeconds - days * 86400 - hours * 3600) / 60);
        var seconds = parseInt(totalSeconds - days * 86400 - hours * 3600 - minutes * 60);
        var timeText = "";
        if (days > 0) timeText += days + "d ";
        if (hours > 0) timeText += hours + "h ";
        if (minutes > 0) timeText += minutes + "m ";
        if (seconds > 0) timeText += seconds + "s ";
        return message.reply("You have to wait **" + timeText + "**to do this again!");
    }
}

module.exports.run = async (client, message, args) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Error")) {
            client.economyManager = JSON.parse(body);
            if (client.economyManager[message.author.id]) {
                info(client, message, args);
                return;
            }
            else {
                client.economyManager[message.author.id] = {
                    coins: encrypt("500"),
                    waifus: [],
                    team: {
                        name: "",
                        members: []
                    }
                };
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "add",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        info(client, message, args);
                        return;
                    }
                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                });
            }
        }
        else return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
    });
}

module.exports.config = {
    name: "battle",
    description: "Battle with a random team or a specific user",
    usage: require("../config.json").prefix + "battle <@mention> (optional)",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}