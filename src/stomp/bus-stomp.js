import SockJS from 'sockjs-client'
import Stomp from 'stompjs'


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

const targetPrefix = '/exchange/'

function parseRegistered (registered, handler) {
  return Object.keys(registered)
    .map(key => {
      return {
        target: key,
        data: registered[key],
      }
    })
    .map(handler)
}

export function sendAll ({client, ...registered}) {
  parseRegistered(registered, function send ({target, data: payload}) {
    client.send(`${targetPrefix}${target}`, {}, JSON.stringify(payload))
  })
}

export function stompActor (options = {}) {
  return parseRegistered(options, function wireStompActor ({target, data: handler}) {
    return new Promise(function stompPromise (resolve, reject) {
      function onConnect () {
        const sub = client.subscribe(`${targetPrefix}${target}`, function onMessage (message) {
          const responses = handler(JSON.parse(message.body))
          sendAll({client, ...responses})
        })
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
        console.log(`ERROR: ${error}}`)
      }

      const webSocket = new SockJS('http://127.0.0.1:15674/stomp')
      const client = Stomp.over(webSocket)
      client.heartbeat.outgoing = 0
      client.heartbeat.incoming = 0
      client.debug = function onDebug (message) {
        console.log(`DEBUG: ${message}`)
      }

      client.connect('guest', 'guest', onConnect, onError, '/')

      handleSIGINT({webSocket, client})
    })
  })
}
