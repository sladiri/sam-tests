export function actions ({ bus }) {
  return {
    actions: Object.freeze({
      reset ({ stepId, args: { sync } }) {
        setTimeout(() => {
          console.log('action - propose reset', { stepId, sync })
          bus.emit('accept', { stepId, count: 0 })
        }, sync ? 0 : 2000)
      },
      incremented ({ stepId, args: { increment } }) {
        setTimeout(() => {
          console.log('action - propose increment:', { stepId, increment })
          bus.emit('accept', { stepId, increment })
        }, Number.parseInt(Math.random() * 1000) + 1000)
      },
    }),
  }
}

let stepId = 0
let prog = []
// let blocked = []
export function state ({ bus, actions }) {
  function popFirstArgs () {
    const [firstArgs, ...remaining] = prog
    prog = remaining
    return firstArgs
  }
  // TODO: Prevent old resets.
  function nap ({ _stepId, state, actions }) {
    if (prog.length > 0) {
      const firstArgs = popFirstArgs()
      bus.emit('action', firstArgs)
    }
    if (state.count > 5) {
      console.log('nap:', { stepId, _stepId, state })
      bus.emit('action', { action: 'reset' })
    }
  }

  // TODO: Queue actions to nap against stale data
  function listen ({ stepId: _stepId, state }) {
    console.log('state - accepted:', { stepId, _stepId, state, prog })
    popFirstArgs()
    bus.emit('stateRep', { state })
    bus.once('render', () => nap({ _stepId, state, actions }))
    stepId += 1
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
    const actionFn = actions[action]
    if (Object.prototype.toString.call(actionFn) === '[object Function]') {
      prog.push(args)
      if (prog.length < 2) {
        console.log('dispatch - action:', { stepId, action })
        actionFn({ stepId, args })
      } else {
        console.log('dispatch - queued action:', { stepId, action, prog })
        const [firstArgs] = prog
        actions[firstArgs.action]({ stepId, args: firstArgs })
      }
    } else {
      console.warn('dispatch - invalid action:', { stepId, action })
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
        console.warn('model - input for increment must be integer:', increment)
      } else if (increment >= 0) {
        state.count += increment
        bus.emit('accepted', { stepId, state })
      } else {
        console.warn('model - rejected increment:', { stepId, increment })
      }
    } else if (args.count !== undefined) {
      state.count = args.count
      bus.emit('accepted', { stepId, state })
    } else {
      console.warn('model - invalid args:', { stepId, args })
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
