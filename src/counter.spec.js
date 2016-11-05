import t from 'purple-tape'
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
})

t('model count increments with value (quick check)', t => {
  const { modelInstance } = setup()
  const check = p.forall(p.integer(), n => {
    const current = modelInstance.state().count
    modelInstance.accept({ proposal: { count: n } })
    return modelInstance.state().count === current + n
  })
  t.equal(p.check(check), true)
})


import EventEmitter3 from 'eventemitter3'

function setupAsync () {
  const bus = new EventEmitter3()
  return {
    bus,
    stateDispose: state({ bus }),
    actionsDispose: action({ bus }),
    modelDispose: model({ bus }),
  }
}

function cleanupAsync ({ bus, stateDispose, actionsDispose, modelDispose }) {
  stateDispose.dispose()
  actionsDispose.dispose()
  modelDispose.dispose()
}

t('model count increments with value (quick check, async)', function* (t) {
  const dispose = setupAsync()
  let current
  const start = new Promise((resolve, reject) => {
    function getCurrent ({ state: { count } }) {
      current = count
      resolve()
      dispose.bus.removeAllListeners('accepted')
    }
    dispose.bus.on('accepted', getCurrent)
  })
  dispose.bus.emit('accept', { proposal: { count: 0 } })
  const check = p.check(p.forall(p.integer(), n => {
    current = current + n
    return start.then(() => {
      const next = new Promise((resolve, reject) => {
        dispose.bus.on('accepted', ({ state: { count } }) => {
          resolve(count === current)
          dispose.bus.removeAllListeners('accepted')
        })
      })
      dispose.bus.emit('accept', { proposal: { count: n } })
      return next
    })
  }))
  t.equal(yield check, true)
  cleanupAsync(dispose)
})
