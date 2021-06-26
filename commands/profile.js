const { profile } = require("console");
const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");
const Canvas = require("canvas");

async function prof(client, message, args, language, user) {
    var data = client.economyManager[user.id];
    var theme;
    if (!data.theme || data.theme == "dark") theme = "dark";
    else theme = "light";
    const canvas = Canvas.createCanvas(854, 480);
    const ctx = canvas.getContext('2d');

    var structure;
    if (theme == "dark") structure = await Canvas.loadImage("./assets/profile_card_structure_dark.png");
    else structure = await Canvas.loadImage("./assets/profile_card_structure.png");
    ctx.drawImage(structure, 0, 0, 854, 480);
    var background;
    if (!data.background) background = await Canvas.loadImage("./assets/background_default.png");
    else background = await Canvas.loadImage("./assets/" + data.background + ".png");
    ctx.drawImage(background, 0, 0, 854, 160);
    const avatar = await Canvas.loadImage(user.avatarURL({format: "png", size: 128}));
    ctx.drawImage(avatar, 82, 103, 136, 136);
    var font = "Baloo 2";
    ctx.font = "bold 32px " + font;
    if (theme == "dark") ctx.fillStyle = '#ffffff';
    else ctx.fillStyle = '#000000';
    ctx.textAlign = "center";
    ctx.fillText(user.username, 148, 295, 266, 40);
    ctx.font = "22px " + font;
    ctx.fillStyle = '#adadad';
    ctx.textAlign = "center";
    ctx.fillText("#" + user.discriminator, 148, 325, 266, 40);
    const coinIcon = await Canvas.loadImage("./assets/coin_icon.png");
    ctx.drawImage(coinIcon, 33, 365, 42, 42);
    ctx.font = "24px " + font;
    if (theme == "dark") ctx.fillStyle = '#ffffff';
    else ctx.fillStyle = '#000000';
    ctx.textAlign = "left";
    ctx.fillText(parseInt(decrypt(client.economyManager[user.id].coins)).toLocaleString(), 90, 395, 194, 40);
    const messageIcon = await Canvas.loadImage("./assets/message_icon.png");
    ctx.drawImage(messageIcon, 33, 415, 42, 42);
    ctx.fillText((client.economyManager[user.id].messagePoints) ? parseInt(decrypt(client.economyManager[user.id].messagePoints)).toLocaleString() : "0", 90, 445, 194, 40);
    ctx.font = "bold 26px " + font;
    ctx.fillText(user.username + "'s Biography:", 314, 216, 498, 40);
    ctx.textAlign = "right";
    ctx.font = "18px " + font;
    ctx.fillText("User's ID: " + user.id, 822, 460, 400, 40);
    ctx.textAlign = "left";
    ctx.font = "20px " + font;
    var bio = "No biography was set.";
    if (data.bio) bio = data.bio;
    ctx.fillText(bio, 314, 246, 498, 184);


    message.channel.send('', {
        files: [{
            attachment: canvas.toBuffer(),
            name: 'profile.png'
        }]
    });
}

module.exports.run = async (client, message, args, language) => {
    if (!message.mentions.users.size) {
        if (client.economyManager[message.author.id]) {
            if (!client.economyManager[message.author.id].coins) return message.reply(language.coinError);
            try {
                prof(client, message, args, language, message.author);
                return;
            }
            catch (err) {
                console.log(err);
                return message.reply(language.unexpectedErrorOccurred);
            }
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            if (!client.economyManager[message.author.id].coins) return message.reply(language.coinError);
                            try {
                                prof(client, message, args, language, message.author);
                                return;
                            }
                            catch (err) {
                                console.log(err);
                                return message.reply(language.unexpectedErrorOccurred);
                            }
                        }
                        else {
                            try {
                                client.economyManager[message.author.id] = {
                                    coins: encrypt("500"),
                                    background: "background_default",
                                    theme: "dark",
                                    bio: ""
                                };
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: message.author.id,
                                    data: JSON.stringify(client.economyManager[message.author.id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        if (!client.economyManager[message.author.id].coins) return message.reply(language.coinError);
                                        try {
                                            prof(client, message, args, language, message.author);
                                            return;
                                        }
                                        catch (err) {
                                            console.log(err);
                                            return message.reply(language.unexpectedErrorOccurred);
                                        }
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                });
                            }
                            catch (err) {
                                console.error(err);
                                return message.reply(language.unexpectedErrorOccurred);
                            }
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
    else {
        if (client.economyManager[message.mentions.users.first().id]) {
            if (!client.economyManager[message.mentions.users.first().id].coins) return message.reply(language.coinError);
            try {
                prof(client, message, args, language, message.mentions.users.first());
                return;
            }
            catch (err) {
                console.log(err);
                return message.reply(language.unexpectedErrorOccurred);
            }
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.mentions.users.first().id] != undefined) {
                            if (!client.economyManager[message.mentions.users.first().id].coins) return message.reply(language.coinError);
                            try {
                                prof(client, message, args, language, message.mentions.users.first());
                                return;
                            }
                            catch (err) {
                                console.log(err);
                                return message.reply(language.unexpectedErrorOccurred);
                            }
                        }
                        else {
                            try {
                                client.economyManager[message.mentions.users.first().id] = {
                                    coins: encrypt("500"),
                                    background: "background_default",
                                    theme: "dark",
                                    bio: ""
                                };
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: message.mentions.users.first().id,
                                    data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        if (!client.economyManager[message.mentions.users.first().id].coins) return message.reply(language.coinError);
                                        try {
                                            prof(client, message, args, language, message.mentions.users.first());
                                            return;
                                        }
                                        catch (err) {
                                            console.log(err);
                                            return message.reply(language.unexpectedErrorOccurred);
                                        }
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply(language.serverConnectError);
                                });
                            }
                            catch (err) {
                                console.error(err);
                                return message.reply(language.unexpectedErrorOccurred);
                            }
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
}

module.exports.config = {
    name: "profile",
    description: "View your profile card",
    usage: require("../config.json").prefix + "profile",
    accessableby: "Members",
    aliases: [],
    category: "👥 User information",
    dmAvailable: true
}