import {getSignal} from '../stomp/bus_stomp'

export function nap (model) {
}

export function onModel (payload) {
  const model = payload
  let stateRepresentation = 'initial'
  return {state_representation: {stateRepresentation, model}}
}

export function connect () {
  return {
    model: onModel,
    render: nap,
  }
}

getSignal().then(signal => {
  signal({propose: {}})
})
