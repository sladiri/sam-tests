import t from 'tape'
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
    modelInstance.accept({ proposal: { count: n } })
    return modelInstance.state().count === current + n
  })
  t.equal(p.check(check), true)
  t.end()
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

t('model count increments with value (async)', t => {
  t.plan(1)

  const dispose = setupAsync()
  dispose.bus.on('accepted', ({ state: { count } }) => {
    t.equal(count, 42, 'async')
  })
  dispose.bus.emit('accept', { proposal: { count: 42 } })

  cleanupAsync(dispose)
  t.end()
})
