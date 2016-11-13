import 'babel-polyfill'
import {stompActor, sendAll} from './bus-stomp'
import {initialState} from '../sam/model'

const mockConnect = {
  'amq.direct': () => {},
}
Promise.all(stompActor(mockConnect)).then(([{client}]) => {
  setTimeout(() => {
    console.log('initial action')
    sendAll({
      client,
      stateRepresentation: {
        stateRepresentation: 'initial',
        model: initialState,
      },
    })
  }, 1000)
})
