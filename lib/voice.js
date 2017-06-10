const record = require('node-record-lpcm16')
const speech = require('@google-cloud/speech')()

class Action {
  constructor(identifier, words) {
    this.identifier = identifier
    this.words = words
  }
  
  any(...args) {
    return args.indexOf(this.identifier) !== -1
  }
  
  equals(identifier) {
    return this.identifier === identifier
  }
}

module.exports = class Voice {
  constructor(settings) {
    this.settings = settings
    this.recordOptions = {
      sampleRateHertz: this.settings.sampleRateHertz,
      threshold: 0.5,
      verbose: true,
      recordProgram: this.settings.program,
      device: this.settings.device,
      silence: '1.0'
    }
  }

  listen(seconds) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        record.stop()
        reject("timeout")
      }, seconds * 1000)
      const request = { config: { encoding: this.settings.encoding, sampleRateHertz: this.settings.sampleRateHertz, languageCode: this.settings.languageCode }, interimResults: false }
      const stream = speech.createRecognizeStream(request)
      stream.on("data", (data) => {
        console.log("data", data)
        const phrase = data.results.trim().toLowerCase()
        let words = phrase.split(" ")
        if(words.length > 0) {
          let identifier = words.shift()
          record.stop()
          clearTimeout(timeout)
          resolve(new Action(identifier, words))
        }else{
          clearTimeout(timeout)
          console.log(`invalid phrase ${phrase}`)
          reject(`invalid phrase ${phrase}`)
        }
      })
      stream.on("error", (error) => {
        clearTimeout(timeout)
        reject(error)
      })
      record.start(this.recordOptions).pipe(stream)
    })
  }
}
