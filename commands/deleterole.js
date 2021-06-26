const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply(language.insufficientPermission);
	if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) return message.reply(language.missingManageRolesPermission);
	var role;
    if (args[0] && message.mentions.roles.size) role = message.mentions.roles.first();
    else if (args[0] && !message.mentions.roles.size) role = message.guild.roles.cache.find(r => r.name == args.join(" "));
    else if (!args[0]) return message.reply(language.specifyARole);
    if (!role) return message.reply(language.roleNotFound);
    if (role.position >= message.guild.member(client.user).roles.highest.position) return message.reply(language.higherRole);
	role.delete(language.deletedBy + message.author.tag)
	  .then(role => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(language.roleDeleted.replace("$user", message.author.tag).replace("$role", role.name), message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply(language.deleteRoleError);
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