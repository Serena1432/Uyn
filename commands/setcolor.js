const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply(language.insufficientPermission);
	if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply(language.missingManageRolesPermission);
	if (!message.mentions.roles.size) return message.reply(language.missingRoleMention);
	if (!args[1]) return message.reply(language.missingRoleColor);
	if (message.mentions.roles.first().position >= message.guild.member(client.user).roles.highest.position) return message.reply(language.higherRole);
	message.mentions.roles.first().setColor(args[1])
	  .then(role => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(language.recolored("$user", message.author.name).replace("$role", message.mentions.roles.first().name).replace("$color", args[1]), message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply(language.recolorError);
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