const ytsr = require("ytsr");
const Player = require("./player");
const AudioTrack = require("./audioTrack");
const ytdl = require("ytdl-core");

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

    static async search(keyword) {
        const searchResults = await ytsr(keyword, {safeSearch: true, limit: 10});
        const rawResults = searchResults.refinements;
        const results = [];
        for (const i in rawResults) {
            const track = new AudioTrack();
            const info = await ytdl.getBasicInfo(rawResults[i].url);

            track.name = info.videoDetails.title;
            track.uri = info.videoDetails.video_url;
            track.length = info.videoDetails.lengthSeconds;

            results.push(track);
        }
        return results;
    }
}