export function nap (model) {
  console.log('no nap yet')
  return {}
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
