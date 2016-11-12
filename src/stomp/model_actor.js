import 'babel-polyfill'
import {stomp, sendAll} from './bus-stomp'
import {initialState, connect} from '../sam/model'

Promise.all(stomp(connect())).then(([{client}]) => {
  sendAll({
    client,
    stateRepresentation: {
      stateRepresentation: 'initial',
      model: initialState,
    },
  })
})
