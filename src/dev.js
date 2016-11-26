import 'babel-polyfill'
import './stomp/model-actor'
import './stomp/state-handler'
import './stomp/state_representation-handler'
// import {stompConnect, sendAll} from './stomp/bus_stomp'
// import {initialise} from './sam/actions'

// Promise.all(stompConnect({destination: 'exchange', 'amq.direct': () => {}}))
//   .then(([{client}]) => {
//     sendAll({client, ...initialise()})
//   })
