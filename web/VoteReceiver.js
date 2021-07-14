const {encrypt, decrypt} = require("../utils/crypto.js");
const request = require("request");

function vote(client, req, res, user, success) {
    if (success) {
        var coinValue = Math.floor(Math.random() * 4000) + 1000;
        var coins = parseInt(decrypt(client.economyManager[user.id].coins));
        coins += coinValue;
        client.economyManager[user.id].coins = encrypt(coins.toString());
        if (!client.economyManager[user.id].leveling_tickets) client.economyManager[user.id].leveling_tickets = {};
        var lvt = Math.floor(Math.random() * 4) + 1;
        eval("if (client.economyManager[user.id].leveling_tickets.lvt" + lvt + ") client.economyManager[user.id].leveling_tickets.lvt" + lvt + "++; else client.economyManager[user.id].leveling_tickets.lvt" + lvt + " = 1;");
        var gtk = Math.floor(Math.random() * 4) + 1;
        eval("if (client.economyManager[user.id].leveling_tickets.gtk" + gtk + ") client.economyManager[user.id].leveling_tickets.gtk" + gtk + "++; else client.economyManager[user.id].leveling_tickets.gtk" + gtk + " = 1;");
        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
            type: "update",
            token: process.env.php_server_token,
            id: user.id,
            data: JSON.stringify(client.economyManager[user.id])
        }}, function(error, response, body) {
            if (!error && response.statusCode == 200 && body.includes("Success")) {
                user.send("Thank you for voting me " + user.username + "!\nYou have received **" + coinValue.toLocaleString() + " " + client.config.currency + ", 1 Leveling Ticket " + lvt + "★ and 1 Gacha Ticket " + gtk + "★** as a reward!");
                res.send({success: true, message: "Action has been done."});
            }
            else {
                var coins = parseInt(decrypt(client.economyManager[user.id].coins));
                coins -= coinValue;
                client.economyManager[user.id].coins = encrypt(coins.toString());
                eval("client.economyManager[user.id].leveling_tickets.lvt" + lvt + "--");
                eval("client.economyManager[user.id].leveling_tickets.gtk" + gtk + "--");
                user.send("Thank you for voting me " + user.username + "!");
                res.send({success: true, message: "Action has been done, but no coins was given due to server error."})
            }
        });
    }
    else {
        user.send("Thank you for voting me " + user.username + "!");
        res.send({success: true, message: "Action has been done, but no coins was given due to server error."})
    }
}

module.exports.post = function(client, req, res) {
    try {
        if (process.env.dbl_vote_authorization) {
            if (req.headers.authorization != process.env.dbl_vote_authorization) return res.status(401).send({error: 401, message: "Invalid authorization token"});
            if (!req.body.user) return res.status(404).send({error: 404, message: "Invalid user."});
            var user = client.users.cache.get(req.body.user);
            if (!user) return res.status(404).send({error: 404, message: "Invalid user."});
            if (!client.economyManager || !client.economyManager[user.id]) {
                request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                    if (!error && response.statusCode == 200 && !body.includes("Connection failed")) {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[user.id]) {
                            vote(client, req, res, user, true);
                            return;
                        }
                        else {
                            client.economyManager[user.id] = {
                                coins: encrypt("500"),
                                waifus: [],
                                leveling_tickets: {}
                            };
                            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                type: "add",
                                token: process.env.php_server_token,
                                id: user.id,
                                data: JSON.stringify(client.economyManager[user.id])
                            }}, function(error, response, body) {
                                if (!error && response.statusCode == 200 && body.includes("Success")) {
                                    vote(client, req, res, user, true);
                                    return;
                                }
                                else vote(client, req, res, user, false);
                            });
                        }
                    }
                    else vote(client, req, res, user, false);
                });
            }
            else vote(client, req, res, user, true);
        }
        else res.status(404).send({error: 404, message: "No \"dbl_vote_authorization\" Process Environment Variable was found."});
    }
    catch (err) {
        res.status(500).send({error: 500, message: err.toString()})
    }
}