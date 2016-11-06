let _actions = null
export function actions ({ bus }) {
  _actions = _actions || {
    reset ({ sync }) {
      console.log('action - propose reset', sync)
      setTimeout(() => {
        bus.emit('accept', { count: 0 })
      }, sync ? 0 : 2000)
    },
    incremented ({ count }) {
      console.log('action - propose increment:', count)
      bus.emit('accept', { count })
    },
  }
  return {
    actions: Object.freeze(_actions),
  }
}

export function state ({ bus, actions }) {
  function nap ({ state, actions }) {
    if (state.count > 5) {
      console.log('nap:', state)
      bus.emit('action', { action: actions.reset }) // TODO: Prevent old resets.
    }
  }

  function listen ({ state }) { // TODO: Queue actions to nap against stale data
    console.log('state - accepted:', state)
    bus.emit('stateRep', { state, incremented: actions.incremented })
    bus.once('render', () => nap({ state, actions }))
  }
  bus.on('accepted', listen)

  return {
    listen,
    dispose () {
      bus.removeListener('accepted', listen)
    },
  }
}

export function dispatch ({ bus, actions }) {
  function propose (args) {
    const { action } = args
    const actionString = Object.prototype.toString.call(action)
    const actionName = actionString === '[object String]'
      ? action
      : actionString === '[object Function]'
        ? action.name
        : undefined
    if (actionName && Object.prototype.toString.call(actions[actionName]) === '[object Function]') {
      actions[actionName](args)
    } else {
      console.warn('Invalid action:', actionName)
    }
  }
  bus.on('action', propose)

  return {
    dispose () {
      bus.removeListener('action', propose)
    },
  }
}

export function model ({ bus }) {
  const state = {
    count: 0,
  }

  function accept ({ count }) {
    console.log('model - proposal', count)
    if (!Number.isInteger(count)) {
      console.warn('model - input for count must be integer:', count)
    }
    if (count >= 0) {
      state.count = count
      bus.emit('accepted', { state })
    } else {
      console.warn('model - rejected increment:', count)
    }
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
