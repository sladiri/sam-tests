import 'babel-polyfill'
import yo from 'yo-yo'
import { state, action, model } from './counter'
import EventEmitter3 from 'eventemitter3'

const bus = new EventEmitter3()
state({ bus })
const { actions } = action({ bus })
model({ bus })

function view ({ actions }) {
  const increment = event => {
    bus.emit('action', { action: actions.incremented, value: { count: 1 } })
  }
  return function stateRep ({ state }) {
    console.log('view:', state)
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
    bus.emit('render')
  }
}
document.body.appendChild(yo`<div></div>`)
bus.on('stateRep', view({ actions }))
bus.emit('action', { action: actions.reset, value: { sync: true } })
