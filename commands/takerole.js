const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply(language.insufficientPermission);
	if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply(language.missingManageRolesPermission);
	if (!message.mentions.members.size) return message.reply(language.pleaseMentionUser);
	args.splice(0,1);
	var role;
	if (args[0] && message.mentions.roles.size) role = message.mentions.roles.first();
	else if (args[0] && !message.mentions.roles.size) role = message.guild.roles.cache.find(role => role.name == args.join(" "));
	else if (!args[0]) return message.reply(language.specifyARole);
	if (!role) return message.reply(language.roleNotFound);
	if (!message.mentions.members.first().roles.cache.find(memrole => memrole.id == role.id)) return message.reply("This member isn't having that role!");
	if (role.position >= message.guild.member(client.user).roles.highest.position) return message.reply(language.higherRole);
	message.mentions.members.first().roles.remove(role, "Role taken by " + message.author.tag)
	  .then(mrole => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(message.author.tag + " has just taken the " + role.name + " role from " + message.mentions.members.first().user.tag, message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTimestamp()
		  );
		  message.mentions.members.first().user.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor("You have just been taken the " + role.name + " role the " + message.guild.name + " server", message.guild.iconURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setDescription("**Being taken by:** " + message.author.toString())
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply("There's an error while taking the role! Please try again!");
	  });
}

module.exports.config = {
    name: "takerole",
    description: "Take a role from a specific member",
    usage: require("../config.json").prefix + "takerole @mention @role",
    accessableby: "Members",
    aliases: [],
    category: "📜 Roles managing",
    dmAvailable: false
}