import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

const targetPrefix = '/exchange/'

function parseOptions (options, handler) {
  return Object.keys(options).map(key => {
    return {
      target: key,
      data: options[key],
    }
  })
  .map(handler)
}

export function sendAll ({client, ...options}) {
  parseOptions(options, function send ({target, data: payload}) {
    client.send(`${targetPrefix}${target}`, {}, JSON.stringify({payload}))
  })
}

export function stomp (options = {}) {
  return parseOptions(options, function wireStompActor ({target, data: handler}) {
    return new Promise(function stompPromise (resolve, reject) {
      if (Object.prototype.toString.call(target) !== '[object String]' || Object.prototype.toString.call(handler) !== '[object Function]') {
        reject(`Invalid stomp options: ${JSON.stringify({target, handler}, null, '  ')}`)
        return
      }

      const webSocket = new SockJS('http://127.0.0.1:15674/stomp')
      const client = Stomp.over(webSocket)
      client.heartbeat.outgoing = 0
      client.heartbeat.incoming = 0

      function onMessage (message) {
        const responses = handler(JSON.parse(message.body))
        sendAll({client, ...responses})
      }

      function onConnect () {
        const sub = client.subscribe(`${targetPrefix}${target}`, onMessage)
        resolve({
          client,
          dispose () {
            sub.unsubscribe()
            client.disconnect(function onDisconnect () {
              // process.exit()
            })
          },
        })
      }

      function onError (error) {
        console.log(`ERROR: ${error}}`)
      };

      client.debug = function onDebug (message) {
        console.log(`DEBUG: ${message}`)
      }
      client.connect('guest', 'guest', onConnect, onError, '/')
    })
  })
}
