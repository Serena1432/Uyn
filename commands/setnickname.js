const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    if (!message.member.permissions.has("CHANGE_NICKNAME")) return message.reply("You don't have the rights to do this!");
	if (!message.guild.member(client.user).permissions.has("CHANGE_NICKNAME")) return message.reply("BOT doesn't have the Change Nickname permission on this server! Please contact the server admin to fix this issue!");
	if (!message.mentions.members.size) return message.reply("Please mention a member first!");
	args.splice(0,1);
	if (!args[0]) return message.reply("Please specify a name first!");
	if (message.mentions.members.first().roles.highest.position >= message.member.roles.highest.position) return message.reply("This member's highest role is higher than yours!");
	if (message.mentions.members.first().roles.highest.position >= message.guild.member(client.user).roles.highest.position && message.mentions.members.first().user.id != client.user.id) return message.reply("This member's highest role is higher than this BOT's!");
	var newName = args.join(" ");
	message.mentions.members.first().setNickname(newName)
	  .then(res => {
		  message.channel.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor(message.author.tag + " has just changed " + message.mentions.members.first().user.username + "'s nickname", message.author.avatarURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setDescription("**New nickname:** " + newName)
			.setTimestamp()
		  );
		  message.mentions.members.first().user.send(new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777214) + 1)
			.setAuthor("You have just been changed your nickname in the " + message.guild.name + " server", message.guild.iconURL({
                format: "png",
                dynamic: true,
                size: 2048
            }))
			.setDescription("**New nickname:** " + newName + "\n**Being changed by:** " + message.author.toString())
			.setTimestamp()
		  );
	  })
	  .catch(err => {
		  console.error(err);
		  message.reply("There's an error while taking the role! Please try again!");
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