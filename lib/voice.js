const record = require('node-record-lpcm16')
const speech = require('@google-cloud/speech')()

module.exports = class Voice {
  constructor(settings) {
    this.settings = settings
    this.recordOptions = {
      sampleRateHertz: this.settings.sampleRateHertz,
      threshold: 0,
      verbose: false,
      recordProgram: 'rec',
      silence: '3.0'
    }
  }
  
  listen(seconds) {
    return new Promise((resolve, reject) => {
      if(seconds) { setTimeout(() => {
        record.stop()
        reject("timeout")
      }, seconds * 1000) }
      const request = { config: { encoding: this.settings.encoding, sampleRateHertz: this.settings.sampleRateHertz, languageCode: this.settings.languageCode }, interimResults: false }
      const stream = speech.createRecognizeStream(request)
      stream.on("data", (data) => {
        const phrase = data.results.trim().toLowerCase()
        let words = phrase.split(" ")
        if(words.length > 0) {
          let action = words.shift()
          record.stop()
          resolve({ action: action, words: words})
        }else{
          reject(`invalid phrase ${phrase}`)
        }
      })
      stream.on("error", reject)
      record.start(this.recordOptions).pipe(stream)
    })
  }  
}
