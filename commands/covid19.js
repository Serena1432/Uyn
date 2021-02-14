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
    request("https://code.junookyo.xyz/api/ncov-moh/data.json", function(err, response, body) {
        if (!response || response.statusCode != 200) {
            console.log(body);
            return message.channel.send("Cannot connect to the server!");
        }
        var json = JSON.parse(body);
        if (!json.success) return message.channel.send("Cannot connect to the server!");
        message.channel.send({
            embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: 'Bộ Y tế',
                    icon_url: 'https://ncov.moh.gov.vn/corona-home-theme/images/logo_byt.png'
                },
                title: 'COVID-19 Disease Information',
                thumbnail: {
                    url: 'https://png.pngtree.com/png-vector/20200317/ourlarge/pngtree-logo-covid-19-coronavirus-wuhan-vector-illustration-png-image_2162385.jpg'
                },
                fields: [{
                        name: "Number of infections in the world:",
                        value: json.data.global.cases,
                        inline: true
                    },
                    {
                        name: "Number of heals in the world:",
                        value: json.data.global.recovered,
                        inline: true
                    },
                    {
                        name: "Number of deaths in the world:",
                        value: json.data.global.deaths,
                        inline: true
                    },
                    {
                        name: "\u200b",
                        value: "\u200b",
                        inline: false
                    },
                    {
                        name: "Number of infections in the Vietnam:",
                        value: json.data.vietnam.cases,
                        inline: true
                    },
                    {
                        name: "Number of heals in the Vietnam:",
                        value: json.data.vietnam.recovered,
                        inline: true
                    },
                    {
                        name: "Number of deaths in Vietnam:",
                        value: json.data.vietnam.deaths,
                        inline: true
                    },
                    {
                        name: "Stay safe and install Bluezone if you're in Vietnam to protect yourself from this disaster! Thank you so much!",
                        value: "\u200b",
                        inline: false
                    },
                ]
            }
        });
    });
}

module.exports.config = {
    name: "covid19",
    description: "View the informations about COVID-19 disease",
    usage: "u!covid19",
    accessableby: "Members",
    aliases: [],
    category: "😊 Just for fun",
    dmAvailable: true
}