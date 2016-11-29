function clone (object) {
  return JSON.parse(JSON.stringify(object))
}

let state = {
  lastProposalId: undefined,
  field: 0,
}

export function mutate (payload) {
  const {field} = payload
  if (field > 0) {
    state.field += field
  }
}

function onPropose (payload) {
  const backup = clone(state)
  try {
    mutate(payload)
    state.lastProposalId = state.lastProposalId + 1 || 1
  } catch (e) {
    state = backup
    console.error('Reverting model state to backup.', e)
  }

  return {model: clone(state)}
}

export function model (initialState) {
  state = initialState || state
  return onPropose
}

export function connect (state) {
  return {propose: model(state)}
}
