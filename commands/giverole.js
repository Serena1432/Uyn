const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    if (!message.member.permissions.has("MANAGE_ROLES") && message.author.id != 536899471720841228) return message.reply("You don't have the rights to do this!");
	if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply("BOT doesn't have the Manage Roles permission on this server! Please contact the server admin to fix this issue!");
	if (!message.mentions.members.size) return message.reply("Please mention a member first!");
	args.splice(0,1);
	var role;
	if (args[0] && message.mentions.roles.size) role = message.mentions.roles.first();
	else if (args[0] && !message.mentions.roles.size) role = message.guild.roles.cache.find(role => role.name == args.join(" "));
	else if (!args[0]) return message.reply("Please mention a role or specify a role name first!");
	if (!role) return message.reply("Cannot find that role! Please try again!");
	if (message.mentions.members.first().roles.cache.find(memrole => memrole.id == role.id)) return message.reply("This member is currently having that role!");
	if (role.position >= message.guild.member(client.user).roles.highest.position) return message.reply("This role is higher than the BOT's highest role!");
	message.mentions.members.first().roles.add(role, "Role given by " + message.author.tag)
	  .then(mrole => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(message.author.tag + " has just given the " + role.name + " role to " + message.mentions.members.first().user.tag, message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTimestamp()
		  );
		  message.mentions.members.first().user.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor("You have just been given the " + role.name + " role in the " + message.guild.name + " server", message.guild.iconURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setDescription("**Being given by:** " + message.author.toString())
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply("There's an error while giving the role! Please try again!");
	  });
}

module.exports.config = {
    name: "giverole",
    description: "Give a role to a specific member",
    usage: "u!giverole @mention @role",
    accessableby: "Members",
    aliases: [],
    category: "📜 Roles managing",
    dmAvailable: false
}