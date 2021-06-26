const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply(language.insufficientPermission);
	if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply("BOT doesn't have the Manage Roles permission on this server! Please contact the server admin to fix this issue!");
	if (!args[0]) return message.reply("Please specify a role name!");
	var roleName = args.join(" ");
	if (message.guild.roles.cache.find(role => role.name == roleName)) return message.reply("There's already a role with this name!");
	message.guild.roles.create({
	  data: {
		name: roleName
	  },
	  reason: 'Created by ' + message.author.tag,
	})
	  .then(role => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(message.author.tag + " has just created the " + role.name + " role", message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply("There's an error while creating the role! Please try again!");
	  });
}

module.exports.config = {
    name: "createrole",
    description: "Create a role with a specific name",
    usage: require("../config.json").prefix + "createrole (name)",
    accessableby: "Members",
    aliases: [],
    category: "📜 Roles managing",
    dmAvailable: false
}