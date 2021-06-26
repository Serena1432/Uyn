const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply(language.insufficientPermission);
	if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply(language.missingManageRolesPermission);
	if (!args[0]) return message.reply(language.specifyRoleName);
	var roleName = args.join(" ");
	if (message.guild.roles.cache.find(role => role.name == roleName)) return message.reply(language.roleAlreadyExist);
	message.guild.roles.create({
	  data: {
		name: roleName
	  },
	  reason: language.createdBy + message.author.tag,
	})
	  .then(role => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(language.roleCreated.replace("$user", message.author.tag).replace("$role", role.name), message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply(language.roleCreationError);
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