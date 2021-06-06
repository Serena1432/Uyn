const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply("You don't have the rights to do this!");
	if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply("BOT doesn't have the Manage Roles permission on this server! Please contact the server admin to fix this issue!");
	var role;
    if (args[0] && message.mentions.roles.size) role = message.mentions.roles.first();
    else if (args[0] && !message.mentions.roles.size) role = message.guild.roles.cache.find(r => r.name == args.join(" "));
    else if (!args[0]) return message.reply("Please mention a role or specify a role name first!");
    if (!role) return message.reply("Cannot find that role! Please try again!");
    if (role.position >= message.guild.member(client.user).roles.highest.position) return message.reply("This role's position is higher than this BOT's highest role's! Please contact the server admin to fix this issue!");
	role.delete("Deleted by " + message.author.tag)
	  .then(role => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(message.author.tag + " has just deleted the " + role.name + " role", message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply("There's an error while deleting the role! Please try again!");
	  });
}

module.exports.config = {
    name: "deleterole",
    description: "Create a specific role",
    usage: require("../config.json").prefix + "deleterole (name)",
    accessableby: "Members",
    aliases: [],
    category: "📜 Roles managing",
    dmAvailable: false
}