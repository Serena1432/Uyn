const Discord = require("discord.js");
const fs = require('fs');
const { inspect } = require('util');

module.exports.run = async (client, message, args) => {
	var usrEvaled = false;
  client.config.ownerId.forEach(async ownerId => {
    if (message.author.id == ownerId) {
		usrEvaled = true;
      let evaled;
      try {
        evaled = await eval(args.join(' '));
      }
      catch (error) {
        console.error(error);
        return message.reply('there was an error during evaluation.');
      }
      return;
    }
  });
  if (!usrEvaled) message.reply("Only BOT developers can run this command!");
}

module.exports.config = {
    name: "eval",
    description: "Evaluate a command (Developer Only)",
    usage: "u!eval",
    accessableby: "Owners",
    aliases: [],
	dmAvailable: true
}
