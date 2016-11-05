import test from 'tape'
import EventEmitter2 from 'eventemitter2'
import { state, action, model } from './counter'

function setup () {
  const bus = {
    on () {},
    emit () {},
    removeListener () {},
  }
  return {
    state: state({ bus }),
    action: action({ bus }),
    model: model({ bus }),
  }
}

function setupAsync () {
  const bus = new EventEmitter2()
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

test('model count starts with 0', t => {
  const { model } = setup()
  model.accept({ proposal: 0 })
  t.equal(model.state.count, 0)
  t.end()
})

test('model count increments with value async', t => {
  t.plan(1)

  const dispose = setupAsync()
  dispose.bus.on('state', ({ state: { count } }) => {
    t.equal(count, 42, 'async')
  })
  dispose.bus.emit('action', { action: 'increment', value: 42 })

  cleanupAsync(dispose)
  t.end()
})
