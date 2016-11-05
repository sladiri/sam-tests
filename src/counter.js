export function state ({ bus }) {
  function listen ({ state }) {
    console.log('state:', state)
    bus.emit('stateRep', { state })
  }

  bus.on('state', listen)

  return {
    listen,
    dispose () {
      bus.removeListener('state', listen)
    },
  }
}

export function action ({ bus }) {
  const methods = {
    increment ({ value }) {
      return { count: value !== undefined ? value : 1 }
    },
  }

  function propose ({ action, value }) {
    const actionString = Object.prototype.toString.call(action)
    const actionName = actionString === '[object String]'
      ? action
      : actionString === '[object Function]'
        ? action.name
        : undefined
    console.log('action:', actionName, value)
    const proposal = methods[actionName]({ value })
    bus.emit('accept', { proposal })
  }

  bus.on('action', propose)

  return {
    methods,
    dispose () {
      bus.removeListener('action', propose)
    },
  }
}

export function model ({ bus }) {
  const state = {
    count: 0,
  }

  function accept ({ proposal }) {
    console.log('proposal:', proposal)
    state.count += proposal.count
    bus.emit('state', { state })
  }

  bus.on('accept', accept)

  return {
    state: Object.freeze(JSON.parse(JSON.stringify(state))),
    accept,
    dispose () {
      bus.removeListener('accept', accept)
    },
  }
}
