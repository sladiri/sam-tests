import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import {type} from 'ramda'

const targetPrefix = '/exchange/'

function getClient (getOnConnect, getOnError) {
  const url = 'http://127.0.0.1:15674/stomp'
  const webSocket = new SockJS(url)
  const client = Stomp.over(webSocket)
  client.heartbeat.outgoing = 0
  client.heartbeat.incoming = 0
  client.debug = function onDebug (message) {
    console.log(`DEBUG: ${message}`)
  }

  client.connect('guest', 'guest', getOnConnect(client), getOnError(client), '/')

  if (global.process) {
    process.on('SIGINT', function handleSIGINT () {
      console.log('Disconnecting STOMP client.')
      client.disconnect(function onDisconnect () {
        console.log(`Closing WebSocket to ${url}`)
        webSocket.close()
        process.exit()
      })
    })
  }
  return client
}

function parseRegistered (registered, handler) {
  return Object.keys(registered).map(key => {
    return {
      target: key,
      data: registered[key],
    }
  })
  .filter(({target, data}) => {
    return (type(target) === 'String' && type(handler) === 'Function')
  })
  .map(handler)
}

export function sendAll ({client, ...registered}) {
  parseRegistered(registered, function send ({target, data: payload}) {
    console.log('sending payload', payload)
    client.send(`${targetPrefix}${target}`, {}, JSON.stringify(payload))
  })
}

export function stompActor (options = {}) {
  if (global.process && options.single !== true) {
    if (process.platform === 'win32') {
      require('readline')
        .createInterface({
          input: process.stdin,
          output: process.stdout,
        })
        .on('SIGINT', function () {
          process.emit('SIGINT')
        })
    }
  }
  return parseRegistered(options, function wireStompActor ({target, data: handler}) {
    return new Promise(function stompPromise (resolve, reject) {
      const getOnConnect = client => function onConnect () {
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
      const getOnError = client => function onError (error) {
        console.log(`ERROR: ${error}}`)
      }
      getClient(getOnConnect, getOnError)
    })
  })
}
