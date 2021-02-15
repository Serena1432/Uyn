const Discord = require("discord.js");
const fs = require('fs');
const { inspect } = require('util');

module.exports.run = async (client, message, args) => {
    if (message.author.id == client.config.ownerId) {
        let evaled;
        try {
          evaled = await eval(args.join(' '));
        }
        catch (error) {
          console.error(error);
          message.reply('there was an error during evaluation.');
        }
    }
    else {
        message.reply("Only " + client.devUsername + " can run this command.");
    }
}

module.exports.config = {
    name: "eval",
    description: "Evaluate a command (Developer Only)",
    usage: "u!eval",
    accessableby: "Owners",
    aliases: [],
	dmAvailable: true
}
