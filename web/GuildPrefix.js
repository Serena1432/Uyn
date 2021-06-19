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

module.exports.post = async function(client, req, res) {
    try {
        if (!req.headers.authorization) return res.status(401).send(JSON.stringify({code: 401, error: "No \"Authorization\" header was found."}));
        var tokenData = await getAccessToken(req.headers.authorization);
        if (tokenData.error) return res.status(500).send(JSON.stringify({code: 500, error: tokenData.error}));
        else if (tokenData.id == null) return res.status(401).send(JSON.stringify({code: 401, error: "Invalid Access Token."}));
        var id = tokenData.id;
        if (!req.body.id) return res.status(400).send(JSON.stringify({code: 400, error: "No \"id\" query was found."}));
        if (!req.body.prefix) return res.status(400).send(JSON.stringify({code: 400, error: "Please type a prefix!"}));
        var guild = client.guilds.cache.get(req.body.id);
        if (!guild) return res.status(404).send(JSON.stringify({code: 404, error: "Cannot get the Guild object. Maybe you entered an invalid Guild ID or the BOT hasn't joined this guild yet."}));
        var member = guild.member(id);
        if (!member) return res.status(404).send(JSON.stringify({code: 404, error: "Cannot get the member information. Are you trying to view information of a guild that you haven't joined?"}));
        if (!member.hasPermission("MANAGE_GUILD")) return res.status(403).send(JSON.stringify({code: 403, error: "You need the Manage Guild permission to do this!"}));
        if (client.customPrefixes[guild.id] && client.customPrefixes[guild.id] == req.body.prefix) return res.status(400).send(JSON.stringify({code: 400, error: "The BOT's prefix on this server is already " + req.body.prefix + "!"}));
        request(process.env.php_server_url + '/SetCustomPrefix.php?token=' + process.env.php_server_token + '&id=' + guild.id + "&prefix=" + encodeURIComponent(req.body.prefix), function(err, response, body) {
            if (!response || response.statusCode != 200 || body.includes('Connection failed')) {
                res.status(500).send(JSON.stringify({code: 500, error: "Failed to connect to the server! Please try again later!"}));
            } else {
                if (body && body.includes('Success')) {
                    request(process.env.php_server_url + '/GetCustomPrefixes.php', function(error, response, body) {
                        if (response && response.statusCode == 200) {
                            client.customPrefixes = JSON.parse(body);
                            res.send(JSON.stringify({message: "Successfully set the BOT's prefix on this server into " + req.body.prefix}));
                        }
                    });
                } else {
                    res.status(500).send(JSON.stringify({code: 500, error: "Failed to connect to the server! Please try again later!"}));
                }
            }
        });
        
    }
    catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
    }
}