import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import {type} from 'ramda'


if (global.process && process.platform === 'win32') {
  require('readline')
    .createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    .on('SIGINT', function () {
      process.emit('SIGINT')
    })
}

function handleSIGINT ({webSocket, client}) {
  if (global.process) {
    process.on('SIGINT', function () {
      client.disconnect(function () {
        webSocket.close()
        process.exit()
      })
    })
  }
}

function parseRegistered (registered, handler) {
  return Object.keys(registered)
    .map(key => {
      const data = registered[key]
      return {
        target: key,
        data,
      }
    })
    .map(handler)
}

const defaultStompOpts = {
  'auto-delete': true,
  durable: false,
  exclusive: false,
}
const DESTINATION = 'queue'

export function sendAll ({client, destination = DESTINATION, stompOpts = defaultStompOpts, ...registered}) {
  parseRegistered(registered, function send ({target, data: json}) {
    const payload = JSON.stringify(json)
    client.send(`/${destination}/${target}`, stompOpts, payload)
  })
}

export function setOnMessage ({handler, client, destination}) {
  return function onMessage (message) {
    const data = JSON.parse(message.body || {})
    const responses = handler(data)
    if (type(responses) === 'Object') {
      sendAll({client, destination, ...responses})
    }
  }
}

const URL = 'http://127.0.0.1:15674/stomp'
const USER = 'guest'
const PASS = USER
const VHOST = 'samtests'

export function stompConnect ({
  url = URL, destination = DESTINATION, user = USER, pass = PASS, vhost = VHOST,
  stompOpts = defaultStompOpts, ...config
} = {}) {
  return parseRegistered(config, function wireStompConnect ({target, data: handler}) {
    return new Promise(function stompPromise (resolve, reject) {
      const webSocket = new SockJS(URL)
      const client = Stomp.over(webSocket)
      client.heartbeat.outgoing = 0
      client.heartbeat.incoming = 0
      client.debug = function onDebug (message) {
        console.log(`DEBUG: ${message}`)
      }

      function onConnect () {
        const onMessage = setOnMessage({handler, client, destination})
        const sub = client.subscribe(`/${destination}/${target}`, onMessage, stompOpts)
        resolve({
          client,
          dispose () {
            sub.unsubscribe()
            return new Promise((resolve, reject) => {
              client.disconnect(function onDisconnect () {
                resolve()
              })
            })
          },
        })
      }
      function onError (error) {
        console.log(`ERROR: ${error}`)
      }

      client.connect(user, pass, onConnect, onError, vhost)

      handleSIGINT({webSocket, client})
    })
  })
}

let signal = null
export function getSignal () {
  return signal || do {
    const signalOptions = {
      destination: 'exchange',
      'amq.direct': () => {},
    }

    signal = Promise.all(stompConnect(signalOptions))
      .then(([{client}]) => action => {
        sendAll({client, ...action})
      }
    )
  }
}
