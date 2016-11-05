import test from 'tape'
import EventEmitter2 from 'eventemitter2'
import { model, actions } from './counter'

const setup = () => {
  const server = new EventEmitter2()
  return {
    server,
    modelDispose: model({ server }),
    actionsDispose: actions({ server }),
  }
}
const cleanup = ({ server, modelDispose, actionsDispose }) => {
  server.removeAllListeners('view')
  modelDispose.dispose()
  actionsDispose.dispose()
}

test('model count starts with 0', t => {
  t.plan(1)

  const { server, modelDispose, actionsDispose } = setup()
  server.on('view', ({ state: { count } }) => {
    t.equal(count, 0)
  })
  server.emit('action', { action: 'increment', value: 0 })

  cleanup({ server, modelDispose, actionsDispose })
  t.end()
})

test('model count increments with value', t => {
  t.plan(1)

  const { server, modelDispose, actionsDispose } = setup()
  server.on('view', ({ state: { count } }) => {
    t.equal(count, 42)
  })
  server.emit('action', { action: 'increment', value: 42 })

  cleanup({ server, modelDispose, actionsDispose })
  t.end()
})
