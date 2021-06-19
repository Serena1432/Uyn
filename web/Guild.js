const request = require("request");

function getAccessToken(token) {
    return new Promise(function(resolve, reject) {
        try {
            request(process.env.php_server_url + "/GetAccessTokenID.php?token=" + process.env.php_server_token + "&code=" + token, function(error, res, body) {
                if (!error && res.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    resolve({
                        error: "A server error has occurred."
                    })
                }
            });
        }
        catch (err) {
            console.log(err);
            resolve({
                error: err.toString()
            })
        }
    });
}

module.exports.get = async function(client, req, res) {
    try {
        if (!req.headers.authorization) return res.status(401).send(JSON.stringify({code: 401, error: "No \"Authorization\" header was found."}));
        var tokenData = await getAccessToken(req.headers.authorization);
        if (tokenData.error) return res.status(500).send(JSON.stringify({code: 500, error: tokenData.error}));
        else if (tokenData.id == null) return res.status(401).send(JSON.stringify({code: 401, error: "Invalid Access Token."}));
        var id = tokenData.id;
        if (!req.query.id) return res.status(400).send(JSON.stringify({code: 400, error: "No \"id\" query was found."}));
        var guild = client.guilds.cache.get(req.query.id);
        if (!guild) return res.status(404).send(JSON.stringify({code: 404, error: "Cannot get the Guild object. Maybe you entered an invalid Guild ID or the BOT hasn't joined this guild yet."}));
        var member = guild.member(id);
        if (!member) return res.status(404).send(JSON.stringify({code: 404, error: "Cannot get the member information. Are you trying to view information of a guild that you haven't joined?"}));
		if (client.economyManager[guild.id].roles) {
			for (var i = 0; i < client.economyManager[guild.id].roles.length; i++) {
				var role = guild.roles.cache.get(client.economyManager[guild.id].roles[i].id);
				if (role) {
					client.economyManager[guild.id].roles[i].color = role.hexColor;
					client.economyManager[guild.id].roles[i].name = role.name;
				}
			}
		}
        res.send(JSON.stringify({
            id: guild.id,
            name: guild.name,
            icon_url: guild.iconURL({size: 2048, format: "png", dynamic: true}),
            owner: {
                id: guild.owner.user.id,
                name: guild.owner.user.username,
                discriminator: guild.owner.user.discriminator,
                tag: guild.owner.user.tag,
                avatar_url: guild.owner.user.avatarURL({size: 2048, format: "png", dynamic: true}),
            },
            member_count: guild.memberCount,
            is_owner: (id == guild.owner.user.id) ? true : false,
            permissions: {
                CREATE_INSTANT_INVITE: (member.hasPermission("CREATE_INSTANT_INVITE")) ? true : false,
                KICK_MEMBERS: (member.hasPermission("KICK_MEMBERS")) ? true : false,
                BAN_MEMBERS: (member.hasPermission("BAN_MEMBERS")) ? true : false,
                ADMINISTRATOR: (member.hasPermission("ADMINISTRATOR")) ? true : false,
                MANAGE_CHANNELS: (member.hasPermission("MANAGE_CHANNELS")) ? true : false,
                MANAGE_GUILD: (member.hasPermission("MANAGE_GUILD")) ? true : false,
                MANAGE_ROLES: (member.hasPermission("MANAGE_ROLES")) ? true : false,
            },
            roles: (client.economyManager[req.query.id]) ? (client.economyManager[req.query.id].roles || []) : [],
            prefix: (client.customPrefixes) ? (client.customPrefixes[req.query.id] || client.config.prefix) : client.config.prefix
        }));
    }
    catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
    }
}