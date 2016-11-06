import t from 'blue-tape'
import p from 'jsverify'
import { actions, state, dispatch, model } from './counter'

function setup () {
  const bus = {
    on () {},
    emit () {},
    removeListener () {},
  }
  return {
    actions: actions({ bus }),
    stateInstance: state({ bus, actions: actions({ bus }) }),
    dispatchInstance: dispatch({ bus, actions: actions({ bus }) }),
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
    modelInstance.accept({ count: n })
    return modelInstance.state().count === n
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
  return {
    bus,
    actions: actions({ bus }),
    stateDispose: state({ bus, actions: actions({ bus }) }),
    dispatchDispose: dispatch({ bus, actions: actions({ bus }) }),
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
      yield await p.check(p.forall(p.nat(), n => {
        const subOnce = busToPromise(bus, 'accepted', ({ state: { count } }) => {
          return count === n
        })
        bus.emit('accept', { count: n })
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
