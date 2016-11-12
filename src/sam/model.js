import {type} from 'ramda'

function clone (object) {
  return JSON.parse(JSON.stringify(object))
}

export const initialState = {
  field: 42,
}

export function model (state) {
  return function onPropose (payload) {
    const {proposal} = payload
    if (type(proposal) === 'Number' && proposal > 0) {
      state.field += proposal
    }
    return {
      model: clone(state),
    }
  }
}

export function connect (state) {
  return {
    action: model(state),
  }
}
