const settings = require("./config/settings.json")
const player = require('play-sound')()

const Voice = require("./lib/voice")
const Client = require("./lib/client")
const Clapper = require('./lib/clapper')

const voice = new Voice(settings.voice)
const client = new Client(settings.client)
const clapper = new Clapper(settings.clapper)

function main() {
  clapper.onClap().then(() => {
    console.log("clap detected")
    client.mute().then(() => {
      console.log("muted")
      player.play('./sound/query.wav')
      voice.listen(8).then((action) => {
        console.log("result action", action.identifier, action.words)
        player.play('./sound/confirm.wav')
        if(action.any("pause", "paws")) {
          client.pause()
        }else if(action.equals("resume")) {
          client.resume()
        }else if(action.equals("next")) {
          client.next()
        }else if(action.equals("previous")) {
          client.previous()
        }else if(action.any("mute", "mew")) {
          client.volume(0)
        }else if(action.any("quiet", "silent")) {
          client.volume(10)
        }else if(action.any("cozy", "cosi")) {
          client.volume(30)
        }else if(action.equals("louder")) {
          client.volume(50)
        }else if(action.equals("party")) {
          client.volume(80)
        }else if(action.equals("hardcore")) {
          client.volume(100)
        }else if(action.equals("play") && action.words.length > 0) {
          console.log("looking up track", action.words)
          client.search(action.words).then((tracks) => {
            console.log("playing track", tracks[0].name)
            client.play(tracks)
          }).catch(() => {
            console.log("track not found")
            player.play('./sound/error.wav')
          })
        }else{
          console.log("unknown action", action.identifier, action.words)
          player.play('./sound/error.wav')
        }
        main()
      }).catch((error) => {
        console.log("error", error)
        player.play('./sound/error.wav')
        client.unmute()
        main()
      })
    })
  })
}

client.start().then(() => {
  console.log("PiPak Listening for instructions ...")
  main()
})
