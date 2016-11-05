function actions ({ bus }) {
  let resetId = null
  return {
    reset ({ value: { sync } }) {
      console.log('action - propose reset', sync)
      if (!resetId) {
        resetId = setTimeout(() => {
          bus.emit('accept', { count: null })
          resetId = null
        }, sync ? 0 : 2000)
      }
    },
    incremented ({ value: { count } }) {
      console.log('action - propose increment:', count)
      if (!Number.isInteger(count)) {
        throw new Error('Input for increment must be integer:', count)
      }
      bus.emit('accept', { count })
    },
  }
}

export function state ({ bus }) {
  const _actions = actions({ bus })
  function nap ({ _actions, state }) {
    if (state.count > 5) {
      console.log('nap:', state)
      bus.emit('action', { action: _actions.reset, value: {} })
    }
  }

  function listen ({ state }) {
    console.log('state - accepted:', state)
    bus.emit('stateRep', { state })
    bus.once('render', () => nap({ _actions, state }))
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
  const _actions = actions({ bus })
  function propose ({ action, value }) {
    const actionString = Object.prototype.toString.call(action)
    const actionName = actionString === '[object String]'
      ? action
      : actionString === '[object Function]'
        ? action.name
        : undefined
    _actions[actionName]({ value })
  }
  bus.on('action', propose)

  return {
    actions: _actions,
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
    state.count = count === null ? 0 : state.count + count
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
