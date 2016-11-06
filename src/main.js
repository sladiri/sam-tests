import 'babel-polyfill'
import yo from 'yo-yo'
import { state, model } from './counter'
import EventEmitter3 from 'eventemitter3'

const bus = new EventEmitter3()
model({ bus })
state({ bus })

function view ({ state }) {
  console.log('view:', state)
  const increment = event => {
    bus.emit('action', {
      action: 'incremented',
      increment: 1,
    })
  }
  const style = state.count < 2
    ? 'color:green'
    : state.count < 5
      ? 'color:goldenrod'
      : 'color:red;'
  const nextView = yo`
    <div>
      <div style="${style}">Model count: ${state.count}</div>
      <button onclick=${increment}>Increment</button>
    </div>`
  yo.update(document.body.firstChild, nextView)
  console.log('view - rendered')
  bus.emit('render')
}
document.body.appendChild(yo`<div></div>`)
bus.on('stateRep', view)
bus.emit('action', { action: 'reset', immediate: true })
