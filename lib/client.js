const Mopidy = require("mopidy")

module.exports = class Client {
  constructor(settings) {
    this.settings = settings
    this.unmuteVolume = null
    this.mopidy = new Mopidy({
      webSocketUrl: `ws://${this.settings.host}:${this.settings.port}/mopidy/ws/`,
      callingConvention: "by-position-only",
      autoConnect: false
    })
  }
  
  start() {
    return new Promise((resolve, reject) => {
      this.mopidy.connect()
      this.mopidy.on("state:online", resolve)
    })
  }
  
  pause() {
    return this.mopidy.playback.pause()
  }
  
  resume() {
    return this.mopidy.playback.resume()
  }
  
  next() {
    return this.mopidy.playback.next()
  }
  
  previous() {
    return this.mopidy.playback.previous()
  }
  
  list(fn) {
    return this.mopidy.playlists.getPlaylists()
  }
  
  mute() {
    return this.mopidy.mixer.getVolume().then((volume) => {
      this.unmuteVolume = volume
      return this.mopidy.mixer.setVolume(10)
    })
  }
  
  unmute() {
    return this.mopidy.mixer.setVolume(this.unmuteVolume)
  }
  
  search(words) {
    return this.mopidy.library.search({any: words}).then((searchResults) => {
      return this._firstSearchResult(searchResults)
    })
  }

  play(track) {
    return this.mopidy.tracklist.add([track]).then((tlTracks) => {
      return this.mopidy.playback.play(tlTracks[0])
    })
  }
  
  _firstSearchResult(searchResults) {
    return new Promise((resolve, reject) => {
      for(let searchResult of searchResults) {
        if(searchResult.tracks && searchResult.tracks.length > 0) {
          return resolve(searchResult.tracks[0])
        }
      }
      reject("not found")
    })
  }
}
