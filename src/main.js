import yo from 'yo-yo'
import { model, actions } from './counter'
import EventEmitter2 from 'eventemitter2'

const display = ({ view }) => {
  yo.update(document.body, view)
}

const stateRep = ({ state }) => {
  display({ view: yo`<div>Model count: ${state.count}</div>` })
}

const server = new EventEmitter2()
server.on('newListener', function (value) {
  console.log('server got new listener:', value)
})

server.on('view', stateRep)

document.body.appendChild(yo`<div></div>`)
model({ server })
actions({ server })
server.emit('action', { action: 'increment', value: 0 })
