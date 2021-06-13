module.exports.run = async (client, message, args) => {
    require("./inventory.js").run(client, message, args);
}

module.exports.config = {
    name: "inv",
    description: "View your inventory",
    usage: require("../config.json").prefix + "inv <page>",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}