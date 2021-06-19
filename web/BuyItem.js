const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");
const Discord = require("discord.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function gbuy(client, req, res, guild, member) {
    if (isNaN(req.body.item_id)) return res.status(400).send({code: 400, error: "The item ID must be a number!"});
    if (!guild.member(client.user).hasPermission("MANAGE_ROLES")) return res.status(500).send({code: 500, error: "BOT doesn't have the Manage Roles permission! Please contact the server admin!"});
    if (!client.economyManager[guild.id] || client.economyManager[guild.id].roles.length == 0) return res.status(400).send({code: 400, error: "Invalid item ID!"});
    if (!client.economyManager[guild.id].roles[parseInt(req.body.item_id) - 1]) return res.status(404).send({code: 404, error: "Invalid item ID!"});
    var role = guild.roles.cache.get(client.economyManager[guild.id].roles[parseInt(req.body.item_id) - 1].id);
    if (!role) return res.status(y0y).send({code: 404, error: "Cannot get the role information!"});
    if (member.roles.cache.get(role.id)) return res.status(403).send({code: 403, error: "You have already had that role!"});
    if (role.position >= guild.member(client.user).roles.highest.position) return res.status(500).send({code: 500, error: "This role's position is higher than the BOT's highest role's!"});
    if (parseInt(decrypt(client.economyManager[member.user.id].coins)) < client.economyManager[guild.id].roles[parseInt(req.body.item_id) - 1].price) return res.status(500).send({code: 500, error: "Insufficent balance!"});
    try {
        var coins = parseInt(decrypt(client.economyManager[member.user.id].coins));
        coins -= parseInt(client.economyManager[guild.id].roles[parseInt(req.body.item_id) - 1].price);
        client.economyManager[member.user.id].coins = encrypt(coins.toString());
        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
            type: "update",
            token: process.env.php_server_token,
            id: member.user.id,
            data: JSON.stringify(client.economyManager[member.user.id])
        }}, function(error, response, body) {
            if (!error && response.statusCode == 200 && body.includes("Success")) {
                member.roles.add(role, "Bought the role from the server shop in " + client.user.username + "'s website").then(r => {
                    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    let result = "";
                    for (let i = 0; i < 32; i++) {
                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                    }
                    if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**Transaction ID:** " + result, new Discord.MessageEmbed()
                        .setColor(Math.floor(Math.random() * 16777215))
                        .setAuthor(member.user.username + " has just bought \"" + role.name + "\" role for " + client.economyManager[guild.id].roles[parseInt(req.body.item_id) - 1].price + " " + client.config.currency + " from the \"" + guild.name + "\" server shop on the uynbot.ga website.", member.user.avatarURL({size: 128}))
                        .setTimestamp()
                    );
                    else console.log("Cannot get the log channel.");
                    return res.send({transaction_id: result, message: "Succesfully bought the " + role.name + " role."});
                }).catch(err => {
                    console.log(err);
                    coins = parseInt(decrypt(client.economyManager[member.user.id].coins));
                    coins += parseInt(client.economyManager[guild.id].roles[parseInt(req.body.item_id) - 1].price);
                    client.economyManager[member.user.id].coins = encrypt(coins.toString());
                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                        type: "update",
                        token: process.env.php_server_token,
                        id: member.user.id,
                        data: JSON.stringify(client.economyManager[member.user.id])
                    }}, function(error, response, body) {
                        res.status(500).send({code: 500, error: "An error has occurred while buying the role! Please try again!"});
                    });
                });
            }
            else {
                coins = parseInt(decrypt(client.economyManager[member.user.id].coins));
                coins += parseInt(client.economyManager[guild.id].roles[parseInt(req.body.item_id) - 1].price);
                client.economyManager[member.user.id].coins = encrypt(coins.toString());
                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                return res.status(500).send({code: 500, error: "Something wrong happened with the BOT server! Can you contact the developer to fix it?"});
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send({code: 500, error: "An unexpected error occurred."});
    }
}

function getAccessToken(token) {
    return new Promise(function(resolve, reject) {
        try {
            request(process.env.php_server_url + "/GetAccessTokenID.php?token=" + process.env.php_server_token + "&code=" + token, function(error, res, body) {
                if (!error && res.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    resolve({
                        error: "A server error has occurred."
                    })
                }
            });
        }
        catch (err) {
            console.log(err);
            resolve({
                error: err.toString()
            })
        }
    });
}

module.exports.post = async function(client, req, res) {
    try {
        if (!req.headers.authorization) return res.status(401).send(JSON.stringify({code: 401, error: "No \"Authorization\" header was found."}));
        var tokenData = await getAccessToken(req.headers.authorization);
        if (tokenData.error) return res.status(500).send(JSON.stringify({code: 500, error: tokenData.error}));
        else if (tokenData.id == null) return res.status(401).send(JSON.stringify({code: 401, error: "Invalid Access Token."}));
        var id = tokenData.id;
        if (!req.body.guild_id) return res.status(400).send(JSON.stringify({code: 400, error: "No \"guild_id\" query was found."}));
        if (!req.body.item_id) return res.status(400).send(JSON.stringify({code: 400, error: "No \"item_id\" query was found."}));
        var guild = client.guilds.cache.get(req.body.guild_id);
        if (!guild) return res.status(404).send(JSON.stringify({code: 404, error: "Cannot get the Guild object. Maybe you entered an invalid Guild ID or the BOT hasn't joined this guild yet."}));
        var member = guild.member(id);
        if (!member) return res.status(404).send(JSON.stringify({code: 404, error: "Cannot get the member information. Are you trying to view information of a guild that you haven't joined?"}));
        request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
            if (!error && response.statusCode == 200 && !body.includes("Error")) {
                client.economyManager = JSON.parse(body);
                if (client.economyManager[member.user.id]) {
                    gbuy(client, req, res, guild, member);
                    return;
                }
                else {
                    client.economyManager[member.user.id] = {
                        coins: encrypt("500")
                    };
                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                        type: "add",
                        token: process.env.php_server_token,
                        id: member.user.id,
                        data: JSON.stringify(client.economyManager[member.user.id])
                    }}, function(error, response, body) {
                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                            gbuy(client, req, res, guild, member);
                            return;
                        }
                        else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return res.status(500).send({code: 500, error: "Something wrong happened with the BOT server! Can you contact the developer to fix it?"});
                    });
                }
            }
            else return res.status(500).send({code: 500, error: "Something wrong happened with the BOT server! Can you contact the developer to fix it?"});
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
    }
}