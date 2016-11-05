export function state ({ bus }) {
  function listen ({ state }) {
    console.log('accepted:', state)
    bus.emit('stateRep', { state })
  }

  bus.on('accepted', listen)

  return {
    listen,
    dispose () {
      bus.removeListener('accepted', listen)
    },
  }
}

export function action ({ bus }) {
  const actions = {
    increment ({ value }) {
      if (!Number.isInteger(value)) {
        throw new Error('Input for increment must be integer:', value)
      }
      return { count: value }
    },
  }

  function propose ({ action, value }) {
    const actionString = Object.prototype.toString.call(action)
    const actionName = actionString === '[object String]'
      ? action
      : actionString === '[object Function]'
        ? action.name
        : undefined
    const proposal = actions[actionName]({ value })
    bus.emit('accept', { proposal })
  }

  bus.on('action', propose)

  return {
    actions,
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
    state.count += proposal.count
    bus.emit('accepted', { state })
  }

  bus.on('accept', accept)

  return {
    state () {
      return Object.freeze(JSON.parse(JSON.stringify(state)))
    },
    accept,
    dispose () {
      bus.removeListener('accept', accept)
    },
  }
}
