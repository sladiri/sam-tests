function clone (object) {
  return JSON.stringify(JSON.parse(object))
}

export const initialState = {
  field: 42,
}

export function model (state) {
  return function onPropose ({payload}) {
    const proposal = payload
    if (proposal) { state.field += 1 }
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
