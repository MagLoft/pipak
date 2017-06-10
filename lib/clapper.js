const exec = require("child_process").exec

module.exports = class Clapper {
  constructor(settings) {
    this.settings = {
      device: "coreaudio default",
      threshold : "10%",
      amplitude: 0.7,
      energy: 0.3,
      maxDuration: 1500
    }
    this.resolve = null
    Object.assign(this.settings, settings)
  }
  
  onClap() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve
      this.listen()
    })
  }
  
  listen() {
    let body = ""
    const cmd = `sox -t ${this.settings.device} input.wav silence 1 0.0001 ${this.settings.threshold} 1 0.1 ${this.settings.threshold} -q stat`
    const child = exec(cmd)
    child.stderr.on("data", (data) => {
      body += data
    })
    child.on("exit", () => {
      const stats = this.parse(body)
      if(this.isClap(stats) && this.resolve) {
        this.resolve()
        this.resolve = null
      }else{
        this.listen()
      }
    })
  }
  
  isClap(stats) {
    return (stats["Length (seconds)"] < this.settings.maxDuration && stats["Maximum amplitude"] > this.settings.amplitude && stats["RMS amplitude"] < this.settings.energy)
  }

  parse(body) {
    let data = body.replace(new RegExp("[ \\t]+", "g") , " ")
    let split = new RegExp("^(.*):\\s*(.*)$", "mg"), match, dict = {}
    while(match = split.exec(data)) {
      dict[match[1]] = parseFloat(match[2])
    }
    return dict
  }
}
