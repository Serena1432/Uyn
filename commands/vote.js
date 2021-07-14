module.exports.run = async (client, message, args, language) => {
    message.channel.send("", {embed: {
        color: Math.floor(Math.random() * 16777214) + 1,
        description: language.vote.replace("$id", client.user.id)
    }});
}

module.exports.config = {
    name: "vote",
    description: "Vote this BOT on Top.gg",
    usage: require("../config.json").prefix + "vote",
    accessableby: "Members",
    aliases: [],
    category: "🤖 BOT information",
    dmAvailable: true
}