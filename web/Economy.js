const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

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
        if (client.economyManager[id]) {
            if (!client.economyManager[id].coins) return res.status(500).send(JSON.stringify({code: 500, error: "Cannot get the coins information."}));
            try {
                var economy = client.economyManager[id];
                economy.coins = parseInt(decrypt(client.economyManager[id].coins));
                economy.message_points = parseInt(decrypt(client.economyManager[id].messagePoints));
                economy.messagePoints = undefined;
                return res.send(economy);
            }
            catch (err) {
                console.log(err);
                return res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
            }
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Error")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[id] != undefined) {
                            if (!client.economyManager[id].coins) return res.status(500).send(JSON.stringify({code: 500, error: "Cannot get the coins information."}));
                            try {
                                var economy = client.economyManager[id];
                                economy.coins = parseInt(decrypt(client.economyManager[id].coins));
                                economy.message_points = parseInt(decrypt(client.economyManager[id].messagePoints));
                                economy.messagePoints = undefined;
                                return res.send(economy);
                            }
                            catch (err) {
                                console.log(err);
                                return res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
                            }
                        }
                        else {
                            try {
                                client.economyManager[id] = {
                                    coins: encrypt("500")
                                };
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: id,
                                    data: JSON.stringify(client.economyManager[id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        if (!client.economyManager[id].coins) return res.status(500).send(JSON.stringify({code: 500, error: "Cannot get the coins information."}));
                                        try {
                                            var economy = client.economyManager[id];
                                            economy.coins = parseInt(decrypt(client.economyManager[id].coins));
                                            economy.message_points = parseInt(decrypt(client.economyManager[id].messagePoints));
                                            economy.messagePoints = undefined;
                                            return res.send(economy);
                                        }
                                        catch (err) {
                                            console.log(err);
                                            return res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
                                        }
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return res.status(500).send(JSON.stringify({code: 500, error: "Server connection error."}));
                                });
                            }
                            catch (err) {
                                console.error(err);
                                return res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                        return res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
                    }
                }
                else return res.status(500).send(JSON.stringify({code: 500, error: "Server connection error."}));
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify({code: 500, error: err.toString()}));
    }
}