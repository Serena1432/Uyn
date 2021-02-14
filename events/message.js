const request = require("request");

module.exports = async (client, message) => {
    // Ignore all bots
    if (message.author.bot) return;
	
	client.sentMessages++;
	
	// Ping-responsing part
	var today = new Date();
	if (message.mentions.users.size == 1 && message.content.length < 125 && client.quotes[message.mentions.users.first().id] && !message.author.bot && today.getHours() != 20 && today.getHours() != 21 && today.getHours() != 22 && today.getHours() != 23 && !message.channel.name.includes('bot')) {
        if (!client.floodchat[message.mentions.users.first().id]) {
            client.users.fetch(message.mentions.users.first().id).then((user) => {
                const mess = {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    description: client.quotes[message.mentions.users.first().id],
                    footer: {
                        text: user.tag,
                        icon_url: user.avatarURL({
                            format: "png",
                            dynamic: true,
                            size: 2048
                        })
                    }
                };
                message.channel.send({
                    embed: mess
                }).then(msg => {
                    msg.delete({
                        timeout: 5000
                    })
                });
            });
            client.floodchat[message.mentions.users.first().id] = true;
            var fbQuote = setInterval(function() {
                if (client.floodchat[message.mentions.users.first().id]) {
                    client.floodchat[message.mentions.users.first().id] = null;
                    clearInterval(fbQuote);
                }
            }, 60000);
        } else {
            message.react('❌').then(react => setTimeout(function() {
				react.remove();
			}, 2000));
        }
    }

    // Assign the current prefix first
    var prefix = client.config.prefix;
    // Detect if it was a Guild Chat, if yes, go to the Custom Prefixes part
    if (message.channel.type == "text") {
        // If the client.config.customPrefixes was null, refresh it
        if (!client.config.customPrefixes) {
            request(process.env.php_server_token + '/GetCustomPrefixes.php', function(error, response, body) {
                if (response && response.statusCode == 200 && !body.includes("Connection failed")) {
                    // Refreshing the prefixes list
                    client.config.customPrefixes = JSON.parse(body);
                    // Go to the Custom Prefix part
                    CustomPrefix();
                }
            });
        }
        else CustomPrefix();
    }
    
    // Custom Prefix part
    function CustomPrefix() {
        // Check if the server has a prefix, if yes, assign it as the current prefix
        if (client.config.customPrefixes[message.guild.id]) prefix = client.config.customPrefixes[message.guild.id];
    }
    
    // Done the Custom Prefix part.
   
    if (message.mentions.users.size)
    if (message.mentions.users.first().id == client.user.id) message.channel.send("The BOT's prefix in this server is " + prefix + ".").then(message => {
        message.delete({timeout:5000});
    });
  
    // Ignore messages not starting with the prefix
    if (message.content.toLowerCase().indexOf(prefix) !== 0) return;
  
    // Our standard argument/command name definition.
    const args = message.content.slice(prefix.length).trim().split(/\s+/g);
    const command = args.shift().toLowerCase();
  
    // Grab the command data from the client.commands Enmap
    const cmd = client.commands.get(command);
  
    // If that command doesn't exist, silently exit and do nothing
    if (!cmd) return;
	
	client.botMessages++;
  
    // Run the command
	if (message.channel.type == "dm") {
		if (cmd.config.dmAvailable) cmd.run(client, message, args);
		else message.channel.send("This command cannot be executed in a Direct Messages channel!");
	}
	else {
		if (message.guild.member(client.user).hasPermission("SEND_MESSAGES")) {
			if (!message.channel.permissionOverwrites.get(client.user.id) || message.channel.permissionOverwrites.get(client.user.id).deny.has("SEND_MESSAGES") != true) 
				cmd.run(client, message, args);
			else message.author.send("I don't have permission to send messages on the **" + message.guild.name + "** server! Please contact the server admin to fix the issue!");
		}
		else message.author.send("I don't have permission to send messages on the **" + message.guild.name + "** server! Please contact the server admin to fix the issue!");
	}
};
