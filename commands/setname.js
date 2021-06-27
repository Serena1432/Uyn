const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply(language.insufficientPermission);
	if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply(language.missingManageRolesPermission);
	if (!message.mentions.roles.size) return message.reply(language.missingRoleMention);
	if (!args[1]) return message.reply(language.missingRoleName);
	if (message.mentions.roles.first().position >= message.guild.member(client.user).roles.highest.position) return message.reply(language.higherRole);
	args.splice(0,1);
	var roleName = args.join(" ");
	if (message.guild.roles.cache.find(role => role.name == roleName)) return message.reply(language.roleAlreadyExist);
	message.mentions.roles.first().setName(roleName)
	  .then(role => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(language.roleRenamed.replace("$user", message.author.name).replace("$role", role.name), message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply(language.renamingError);
	  });
}

module.exports.config = {
    name: "setname",
    description: "Change the name of a specific role",
    usage: require("../config.json").prefix + "setname @role (name)",
    accessableby: "Members",
    aliases: [],
    category: "📜 Roles managing",
    dmAvailable: false
}