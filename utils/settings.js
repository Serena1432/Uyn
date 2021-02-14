const Discord = require("discord.js");
const fs = require('fs');
const request = require('request');
const mongoose = require("mongoose");

module.exports = (client) => {
    client.getGuild = async (guild) => {
        let data = await Guild.findOne({ guildID: guild.id });
        if (data) return data;
        else return client.config.defaultSettings;
    };

    client.updateGuild = async (guild, settings) => {
        let data = await client.getGuild(guild);

        if (typeof data !== 'object') data = {};
        for (const key in settings) {
            if (data[key] !== settings[key]) data[key] = settings[key];
            else return;
        }

        return await data.updateOne(settings);
    };

    client.createGuild = async (settings) => {
        let defaults = Object.assign({ _id: mongoose.Types.ObjectId() }, client.config.defaultSettings);
        let merged = Object.assign(defaults, settings);

        const newGuild = await new Guild(merged);
        return newGuild.save();
    };
};
