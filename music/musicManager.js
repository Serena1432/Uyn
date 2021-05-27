const Player = require("./player");
const musicManager = new Map();

module.exports = class MusicManager {
    static createPlayer(guildID, voiceChannel) {
        musicManager.set(guildID, new Player(voiceChannel));
        return musicManager.get(guildID);
    }
    static getPlayer(guildID) {
        return musicManager.get(guildID);
    }
    static destroy(guildID) {
        const player = musicManager.get(guildID);
        player.voiceChannel.reset();
        musicManager.delete(guildID);
    }
}