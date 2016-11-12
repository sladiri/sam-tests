import 'babel-polyfill'

import {stomp} from './stomp/bus-stomp'
const id = 'amq.fanout'
const testConnect = {
  targets: [id],
  handler: function defaultOnMessage (message) {
    console.log(`default handler got message: ${message}`)
    return []
  },
}
stomp(testConnect).then(({client, dispose}) => {
  client.send(`/exchange/${id}`, {}, JSON.stringify(42))
  client.send(`/exchange/${id}`, {}, JSON.stringify({test: 666}))
  setTimeout(() => {
    dispose()
  }, 1000)
})

import {connect} from './sam/state_representation'
stomp(connect()).then(({client, dispose}) => {
  client.send('/exchange/stateRepresentation', {}, JSON.stringify({
    payload: {
      stateRepresentation: 'initial',
      model: {field: 42},
    },
  }))
  setTimeout(() => {
    dispose()
  }, 1000)
})
