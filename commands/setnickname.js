const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args, language) => {
    if (!message.member.permissions.has("CHANGE_NICKNAME")) return message.reply(language.insufficientPermission);
	if (!message.guild.member(client.user).permissions.has("CHANGE_NICKNAME")) return message.reply(language.insufficentChangeNicknamePermission);
	if (!message.mentions.members.size) return message.reply(language.pleaseMentionUser);
	args.splice(0,1);
	if (!args[0]) return message.reply(language.missingNickname);
	if (message.mentions.members.first().roles.highest.position >= message.member.roles.highest.position) return message.reply(language.higherThanYours);
	if (message.mentions.members.first().roles.highest.position >= message.guild.member(client.user).roles.highest.position && message.mentions.members.first().user.id != client.user.id) return message.reply(language.higherThanBOT);
	var newName = args.join(" ");
	message.mentions.members.first().setNickname(newName)
	  .then(res => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(language.nicknameChanged.replace("$user", message.author.username).replace("$mention", message.mentions.users.first().username), message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setDescription(language.newNickname + newName)
			.setTimestamp()
		  );
		  message.mentions.members.first().user.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(language.nicknameHasBeenChanged("$guild.name", message.guild.name), message.guild.iconURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setDescription(language.newNickname + newName + language.beingChangedBy + message.author.toString())
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply(language.setNicknameError);
	  });
}

module.exports.config = {
    name: "setnickname",
    description: "Set a new nickname for a specific member",
    usage: require("../config.json").prefix + "setnickname @mention (new nickname)",
    accessableby: "Members",
    aliases: [],
    category: "⚙️ Moderations",
    dmAvailable: false
}