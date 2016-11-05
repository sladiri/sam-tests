import t from 'blue-tape'
import p from 'jsverify'
import { state, action, model } from './counter'

function setup () {
  const bus = {
    on () {},
    emit () {},
    removeListener () {},
  }
  return {
    stateInstance: state({ bus }),
    actionInstance: action({ bus }),
    modelInstance: model({ bus }),
  }
}

t('model count starts with 0', t => {
  const { modelInstance } = setup()
  t.equal(modelInstance.state().count, 0)
  t.end()
})

t('model count increments with value (quick check)', t => {
  const { modelInstance } = setup()
  const check = p.forall(p.integer(), n => {
    const current = modelInstance.state().count
    modelInstance.accept({ count: n })
    return modelInstance.state().count === current + n
  })
  t.equal(p.check(check), true)
  t.end()
})


import EventEmitter3 from 'eventemitter3'

const busToPromise = (bus, event, mapper) => {
  const eventHandler = resolve => value => {
    resolve(mapper(value))
    bus.removeListener(event, eventHandler)
  }
  return new Promise((resolve, reject) => {
    bus.on(event, eventHandler(resolve))
  })
}

function setupAsync () {
  const bus = new EventEmitter3()
  return {
    bus,
    stateDispose: state({ bus }),
    actionsDispose: action({ bus }),
    modelDispose: model({ bus }),
  }
}

function cleanupAsync ({ stateDispose, actionsDispose, modelDispose }) {
  stateDispose.dispose()
  actionsDispose.dispose()
  modelDispose.dispose()
}

t('model count increments with value (quick check, async)', t => {
  return (async function* () {
    async function* iterator (bus) {
      let subOnce
      subOnce = busToPromise(bus, 'accepted', ({ state: { count } }) => count)
      bus.emit('accept', { count: 0 })
      let current = await subOnce

      yield await p.check(p.forall(p.integer(), n => {
        current = current + n
        subOnce = busToPromise(bus, 'accepted', ({ state: { count } }) => count === current)
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
