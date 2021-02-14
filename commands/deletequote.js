const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");
const Canvas = require("canvas");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args) => {
    request('https://hvnfollower.herokuapp.com/DeleteQuote.php?token=' + process.env.php_server_token + '&id=' + message.author.id, function(err, response, body) {
        if (!response || response.statusCode != 200 || body.includes('Connection failed')) {
            console.log(body);
            message.channel.send("Cannot connect to the BOT server! Please try again!");
        } else {
            if (body && body.includes('Success')) {
                console.log(body);
                request(process.env.php_server_url + '/GetAllQuotes.php', function(error, response, body) {
                    console.error('error:', error); // Print the error if one occurred
                    console.log(response.statusCode);
                    if (response && response.statusCode == 200) {
                        client.quotes = JSON.parse(body);
                        message.reply("Successfully deleted your quote.");
                    }
                });
            } else {
                console.log(body);
                message.reply("Failed to delete your quote! Please try again!");
            }
        }
    });
}

module.exports.config = {
    name: "deletequote",
    description: "Delete your current ping-responsing message",
    usage: "u!deletequote",
    accessableby: "Members",
    aliases: [],
    category: "💬 Ping-responsing",
    dmAvailable: true
}