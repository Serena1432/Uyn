const Discord = require("discord.js");
const fs = require('fs');

module.exports.run = async (client, message, args) => {
    var data = [],
        categories = [];
    const {
        commands
    } = client;

    if (!args.length) {
        devInfo = [];
        client.config.ownerId.forEach(ownerId => {
            devInfo.push("<@" + ownerId + ">");
        });
        commands.forEach(command => {
            if (command.config.category) {
                var exist = false;
                for (i = 0; i < categories.length; i++)
                    if (categories[i] == command.config.category) exist = true;
                if (!exist) categories.push(command.config.category);
            }
        });
        var fields = [];
        fields.push({
            name: "Developer:",
            value: devInfo.join(", "),
            inline: false
        });
        fields.push({
            name: "BOT Information",
            value: "[Invite Link](https://discord.com/oauth2/authorize?client_id=" + client.user.id + "&scope=bot&permissions=271707254) | [Support Server](https://discord.gg/v9c27j9CQ6)",
            inline: false
        });
        for (i = 0; i < categories.length; i++) {
            var commandList = [];
            commands.forEach(command => {
                if (command.config.category && categories[i] == command.config.category && !command.config.secretCommand) {
                    commandList.push(command.config.name);
                }
            });
            fields.push({
                name: categories[i],
                value: commandList.join(", "),
                inline: false
            });
        }
        var embed = {
            color: 0x0099ff,
            title: "List of " + client.user.username + "'s command",
            author: {
                name: client.user.tag,
                icon_url: client.user.displayAvatarURL(),
            },
            description: "You can use the `help (command)` command to get information about a specific command.",
            thumbnail: {
                url: client.user.displayAvatarURL(),
            },
            fields: fields,
            timestamp: new Date()
        };

        message.channel.send({
            embed: embed
        });
        return;
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
        return message.reply("Invalid command!");
    }

    if (command.config.aliases && command.config.aliases.length) data.push(`**Aliases:** ${command.config.aliases.join(', ')}`);
    if (command.config.description) data.push(`**Description:** ${command.config.description}`);
    if (command.config.usage) data.push(`**Uses:** \`${command.config.usage}\``);
    data.push("**Can be used on a DM channel:** " + command.config.dmAvailable ? "Yes" : "No");

    var embed = new Discord.MessageEmbed()
        .setAuthor(`${command.config.name}`)
        .setDescription(data)
        .setColor('#00FFF3')

    message.channel.send(embed);
}

module.exports.config = {
    name: "help",
    description: "List all of this BOT's commands",
    usage: require("../config.json").prefix + "help",
    accessableby: "Members",
    aliases: [],
	dmAvailable: true
}