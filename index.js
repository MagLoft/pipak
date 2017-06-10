const settings = require("./config/settings.json")
const Voice = require("./lib/voice")
const Client = require("./lib/client")
const voice = new Voice(settings.voice)
const client = new Client(settings.client)
const clap = require('clap-detector')
const player = require('play-sound')()

client.start().then(() => {  
  clap.onClaps(2, 1500, () => {
    console.log("clap")
    client.mute().then(() => {
      console.log("muted")
      player.play('./sound/query.wav', function(err) {
        voice.listen(8).then((response) => {
          player.play('./sound/confirm.wav')
          if(response.action === "pause" || response.action === "paws") {
            client.pause()
          }else if(response.action === "resume") {
            client.resume()
          }else if(response.action === "next") {
            client.next()
          }else if(response.action === "previous") {
            client.previous()
          }else if(response.action === "play" && response.words.length > 0) {
            console.log("looking up track", response.words)
            client.search(response.words).then((track) => {
              console.log("playing song", track.name)
              client.play(track)
            }).catch(() => {
              console.log("track not found")
              player.play('./sound/error.wav')
            })
          }else{
            console.log("unknown action", response.action)
            player.play('./sound/error.wav')
          }
          client.unmute()
        }).catch((error) => {
          console.log("error", error)
          player.play('./sound/error.wav')
          client.unmute()
        })
      })
    })
  })
  clap.start({ AUDIO_SOURCE: settings.voice.device })
})
