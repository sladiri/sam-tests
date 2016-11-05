import yo from 'yo-yo'
import { action, model } from './counter'
import EventEmitter2 from 'eventemitter2'


const bus = new EventEmitter2()
bus.on('newListener', (value) => {
  console.log('bus got new listener:', value)
})

function stateRep ({ state }) {
  console.log('stateRep:', state)
  const view = yo`<div>Model count: ${state.count}</div>`
  yo.update(document.body, view)
}
bus.on('view', stateRep)

document.body.appendChild(yo`<div></div>`)
model({ bus })
const { methods } = action({ bus })
bus.emit('action', { action: methods.increment, value: 0 })
