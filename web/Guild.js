const request = require("request");

module.exports.get = function(client, req, res) {
    try {
        if (!req.query.id) return res.status(400).send(JSON.stringify({code: 400, error: "No \"id\" query was found."}));
        var guild = client.guilds.cache.get(req.query.id);
        if (!guild) return res.status(404).send(JSON.stringify({code: 404, error: "Cannot find the Guild object. Maybe you entered an invalid Guild ID or the BOT hasn't joined this guild yet."}));
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
            permissions: guild.permissions,
            roles: (client.economyManager[req.query.id]) ? (client.economyManager[req.query.id].roles || []) : [],
            prefix: (client.customPrefixes) ? (client.customPrefixes[req.query.id] || client.config.prefix) : client.config.prefix
        }));
    }
    catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
    }
}