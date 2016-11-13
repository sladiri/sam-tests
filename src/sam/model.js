function clone (object) {
  return JSON.parse(JSON.stringify(object))
}

let state = {
  initialRender: true,
  field: 0,
}

function onPropose (payload = {}) {
  const {field, initialRender} = payload

  if (field > 0) {
    state.field += field
  } else if (initialRender === false) {
    state.initialRender = false
  }

  return {model: clone(state)}
}

export function connect (initialState) {
  state = initialState || state
  return {
    propose: onPropose,
  }
}
