export function state ({ bus }) {
  let stepId = 0
  let stack = []
  let blocked = []
  const actions = Object.freeze({
    reset ({ stepId, ...args }) {
      setTimeout(() => {
        if (!blocked.find(({ action }) => action === 'reset')) {
          console.log('action - propose reset', { stepId, args, stack: JSON.stringify(stack) })
          stack.push({ ...args, action: 'reset' })
          bus.emit('accept', { stepId, count: 0 })
        } else {
          console.log('action - blocked reset propose', { stepId, args, stack: JSON.stringify(stack) })
        }
      }, args.sync ? 0 : 2000)
    },
    incremented ({ stepId, ...args }) {
      setTimeout(() => {
        if (!blocked.find(({ action }) => action === 'incremented')) {
          console.log('action - propose increment:', { stepId, args, stack: JSON.stringify(stack) })
          stack.push({ ...args, action: 'incremented' })
          bus.emit('accept', { stepId, increment: args.increment })
        } else {
          console.log('action - blocked propose increment', { stepId, args, stack: JSON.stringify(stack) })
        }
      }, Number.parseInt(Math.random() * 1000) + 1000)
    },
  })

  function nap ({ state, _stepId }) {
    const accepted = stack.pop()
    console.log('nap - removed from stack:', { stepId, _stepId, action: accepted.action, stack: JSON.stringify(stack) })

    if (stack.length > 0) {
      const args = stack.pop()
      console.log('nap - emit from stack:', { stepId, _stepId, action: args.action, stack: JSON.stringify(stack) })
      bus.emit('action', args)
    }

    if (state.count > 4) {
      console.log('nap - emit reset:', { stepId, _stepId, count: state.count })
      bus.emit('action', { action: 'reset' })
    }
  }

  function listen ({ error = false, stepId: _stepId, state }) {
    console.log('state - accepted:', { error, stepId, _stepId, stack: JSON.stringify(stack) })

    if (error) {
      nap({ state, _stepId })
    } else {
      if (state.count > 4) {
        blocked.push({ action: 'incremented', stepId })
      } else if (state.count < 1) {
        blocked = blocked.filter(({ action }) => action !== 'incremented')
      }
      bus.once('render', () => nap({ state, _stepId }))
      bus.emit('stateRep', { state })
    }

    stepId += 1
  }
  bus.on('accepted', listen)

  function propose ({ action, ...args }) {
    const actionFn = actions[action]
    if (Object.prototype.toString.call(actionFn) === '[object Function]') {
      if (!blocked.find(({ action: name }) => name === action)) {
        console.log('dispatch - call action:', { stepId, action, args })
        actions[action]({ ...args, stepId })
      } else {
        console.log('dispatch - blocked action:', { stepId, action })
      }
    } else {
      console.log('dispatch - invalid action:', { stepId, action })
    }
  }
  bus.on('action', propose)

  return {
    listen,
    dispose () {
      bus.removeListener('accepted', listen)
      bus.removeListener('action', propose)
    },
  }
}

export function model ({ bus }) {
  const state = {
    count: 0,
  }

  function accept ({ stepId, ...args }) {
    if (args.increment !== undefined) {
      const { increment } = args
      if (!Number.isInteger(increment)) {
        console.log('model - input for increment must be integer:', { increment })
        bus.emit('accepted', { error: true, stepId, state })
      } else if (increment >= 0) {
        console.log('model - increment proposal', { stepId, increment })
        state.count += increment
        bus.emit('accepted', { stepId, state })
      } else {
        console.log('model - rejected increment:', { stepId, increment })
        bus.emit('accepted', { error: true, stepId, state })
      }
    } else if (args.count !== undefined) {
      const { count } = args
      if (!Number.isInteger(count)) {
        console.log('model - input for count must be integer:', { count })
        bus.emit('accepted', { error: true, stepId, state })
      } else {
        console.log('model - count proposal', { stepId, count })
        state.count = args.count
        bus.emit('accepted', { stepId, state })
      }
    } else {
      console.log('model - invalid args:', { stepId, args })
      bus.emit('accepted', { error: true, stepId, state })
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
