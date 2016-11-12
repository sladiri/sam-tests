import eve from 'evejs'
import {msg, unmsg} from './message'

let port = 6000
export function init (config, isClient) {
  eve.system.init(config || {
    transports: [
      // {
      //   type: 'local',
      //   default: true,
      // },
      // {
      //   type: 'ws',
      //   url: isClient
      //     ? 'ws://agents/:id'
      //     : `ws://localhost:${port}/agents/:id`,
      //   localShortcut: false,
      // },
      {
        type: 'http',
        port,
        url: `http://127.0.0.1:${port}/agents/:id`,
        remoteUrl: `http://127.0.0.1:${port}/agents/:id`,
        localShortcut: false,
      },
    ],
  })
  port += 1
}

export function createAgent ({from, handler}) {
  function NewAgent ({from, handler}) {
    eve.Agent.call(this, from)
    // this.extend('request')
    this.connect(eve.system.transports.getAll())
  }
  NewAgent.prototype = Object.create(eve.Agent.prototype)
  NewAgent.prototype.constructor = NewAgent
  NewAgent.prototype.receive = function (from, message) {
    const self = this
    const responses = handler(unmsg(from, from, message))
    responses.forEach(({to, payload}) => {
      self.send(to, msg({payload})).done()
    })
  }
  return new NewAgent({from, handler})
}
