const request = require("request");

module.exports.get = async function(client, req, res) {
    try {
        if (!req.query.id) return res.status(400).send(JSON.stringify({code: 400, error: "No \"id\" query was found."}));
        var guild = client.guilds.cache.get(req.query.id);
        if (!guild) return res.status(404).send(JSON.stringify({code: 404, error: "Cannot get the Guild object. Maybe you entered an invalid Guild ID or the BOT hasn't joined this guild yet."}));
        res.send(JSON.stringify({
            id: guild.id,
            name: guild.name,
            icon_url: guild.iconURL({size: 2048, format: "png", dynamic: true})
        }));
    }
    catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
    }
}