const mongoose = require("mongoose");

const GuildSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    prefix: String
});

module.exports = mongoose.model("guilds", GuildSchema);