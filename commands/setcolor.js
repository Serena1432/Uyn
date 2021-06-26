const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply("You don't have the rights to do this!");
	if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply("BOT doesn't have the Manage Roles permission on this server! Please contact the server admin to fix this issue!");
	if (!message.mentions.roles.size) return message.reply("Please mention a role first!");
	if (!args[1]) return message.reply("Please specify a role color!");
	if (message.mentions.roles.first().position >= message.guild.member(client.user).roles.highest.position) return message.reply("This role is higher than the BOT's highest role!");
	message.mentions.roles.first().setColor(args[1])
	  .then(role => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(message.author.tag + " has just recolored the " + role.name + " role into " + args[1], message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply("There's an error while recoloring the role! Please try again!");
	  });
}

module.exports.config = {
    name: "setcolor",
    description: "Change the color of a specific role",
    usage: require("../config.json").prefix + "setcolor @role (color)",
    accessableby: "Members",
    aliases: [],
    category: "📜 Roles managing",
    dmAvailable: false
}