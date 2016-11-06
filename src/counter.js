let stepId = 0
let prog = []
let blocked = []
export function actions ({ bus }) {
  return {
    actions: Object.freeze({
      reset ({ stepId, args }) {
        setTimeout(() => {
          if (!blocked.find(({ action }) => action === 'reset')) {
            prog.push({ action: 'reset', args })
            console.log('action - propose reset', { stepId, sync: args.sync, blocked })
            bus.emit('accept', { stepId, count: 0 })
          } else {
            console.log('action - blocked propose', { stepId, sync: args.sync, blocked })
          }
        }, args.sync ? 0 : 2000)
      },
      incremented ({ stepId, args }) {
        setTimeout(() => {
          if (!blocked.find(({ action }) => action === 'incremented')) {
            prog.push({ action: 'incremented', args })
            console.log('action - propose increment:', { stepId, increment: args.increment, blocked })
            bus.emit('accept', { stepId, increment: args.increment })
          } else {
            console.log('action - blocked propose', { stepId, increment: args.increment, blocked })
          }
        }, Number.parseInt(Math.random() * 1000) + 1000)
      },
    }),
  }
}
export function state ({ bus, actions }) {
  function nap ({ _stepId, state, actions }) {
    if (prog.length > 0) {
      console.log('nap - prog:', { stepId, _stepId, state, prog })
      const firstArgs = prog.pop()
      bus.emit('action', firstArgs)
    }
    if (state.count > 4) {
      console.log('nap - reset:', { stepId, _stepId, state, prog })
      bus.emit('action', { action: 'reset' })
    }
  }

  function listen ({ stepId: _stepId, state }) {
    console.log('state - accepted:', { stepId, _stepId, count: state.count, prog })
    stepId += 1
    prog.pop()
    if (state.count > 4) {
      blocked.push({ action: 'incremented', stepId })
    } else if (state.count < 1) {
      blocked = blocked.filter(({ action }) => action !== 'incremented')
    }
    bus.emit('stateRep', { state })
    bus.once('render', () => nap({ _stepId, state, actions }))
  }
  bus.on('accepted', listen)
  bus.on('rejected', () => {
    prog.pop()
  })

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
    const actionFn = actions[action]
    if (Object.prototype.toString.call(actionFn) === '[object Function]') {
      if (!blocked.find(({ action: name }) => name === action)) {
        console.log('dispatch - action:', { stepId, action, prog })
        actions[args.action]({ stepId, args })
      } else {
        console.log('dispatch - blocked action:', { stepId, action, prog })
      }
    } else {
      console.log('dispatch - invalid action:', { stepId, action })
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

  function accept ({ stepId, ...args }) {
    console.log('model - proposal', { stepId, args })
    if (args.increment !== undefined) {
      const { increment } = args
      if (!Number.isInteger(increment)) {
        console.log('model - input for increment must be integer:', increment)
      } else if (increment >= 0) {
        state.count += increment
        bus.emit('accepted', { stepId, state })
      } else {
        bus.emit('rejected')
        console.log('model - rejected increment:', { stepId, increment })
      }
    } else if (args.count !== undefined) {
      state.count = args.count
      bus.emit('accepted', { stepId, state })
    } else {
      console.log('model - invalid args:', { stepId, args })
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
