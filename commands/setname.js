const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply("You don't have the rights to do this!");
	if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply("BOT doesn't have the Manage Roles permission on this server! Please contact the server admin to fix this issue!");
	if (!message.mentions.roles.size) return message.reply("Please mention a role first!");
	if (!args[1]) return message.reply("Please specify a role name!");
	if (message.mentions.roles.first().position >= message.guild.member(client.user).roles.highest.position) return message.reply("This role is higher than the BOT's highest role!");
	args.splice(0,1);
	var roleName = args.join(" ");
	if (message.guild.roles.cache.find(role => role.name == roleName)) return message.reply("There's already a role with this name!");
	message.mentions.roles.first().setName(roleName)
	  .then(role => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(message.author.tag + " has just renamed the " + role.name + " role", message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply("There's an error while renaming the role! Please try again!");
	  });
}

module.exports.config = {
    name: "setname",
    description: "Change the name of a specific role",
    usage: "u!setname @role (name)",
    accessableby: "Members",
    aliases: [],
    category: "📜 Roles managing",
    dmAvailable: false
}