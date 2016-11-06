import t from 'blue-tape'
import p from 'jsverify'
import { actions as _actions, state, dispatch, model } from './counter'

function setup () {
  const bus = {
    on () {},
    emit () {},
    removeListener () {},
  }
  const actions = _actions({ bus })
  return {
    actions,
    stateInstance: state({ bus, actions }),
    dispatchInstance: dispatch({ bus, actions }),
    modelInstance: model({ bus }),
  }
}

t('model count resets to 0', t => {
  const { modelInstance } = setup()
  modelInstance.accept({ count: 0 })
  t.equal(modelInstance.state().count, 0)
  t.end()
})

t('model count increments with value (quick check)', t => {
  const { modelInstance } = setup()
  const check = p.forall(p.nat(), n => {
    const current = modelInstance.state().count
    modelInstance.accept({ increment: n })
    return modelInstance.state().count === n + current
  })
  t.equal(p.check(check), true)
  t.end()
})


import EventEmitter3 from 'eventemitter3'

const busToPromise = (bus, event, mapper) => {
  const eventHandler = resolve => value => {
    resolve(mapper(value))
  }
  return new Promise((resolve, reject) => {
    bus.once(event, eventHandler(resolve))
  })
}

function setupAsync () {
  const bus = new EventEmitter3()
  const actions = _actions({ bus })
  return {
    bus,
    actions,
    stateDispose: state({ bus, actions }),
    dispatchDispose: dispatch({ bus, actions }),
    modelDispose: model({ bus }),
  }
}

function cleanupAsync ({ stateDispose, dispatchDispose, modelDispose }) {
  stateDispose.dispose()
  dispatchDispose.dispose()
  modelDispose.dispose()
}

t('model count increments with value (quick check, async)', t => {
  return (async function* () {
    async function* iterator (bus) {
      let current = 0
      yield await p.check(p.forall(p.nat(), n => {
        current += n
        const subOnce = busToPromise(bus, 'accepted', ({ state: { count } }) => {
          return count === current
        })
        bus.emit('accept', { increment: n })
        return subOnce
      }))
    }
    const dispose = setupAsync()
    for await (const result of iterator(dispose.bus)) {
      t.equal(result, true)
    }
    cleanupAsync(dispose)
  }()).next()
})
