import yo from 'yo-yo'
import { state, action, model } from './counter'
import EventEmitter3 from 'eventemitter3'


const bus = new EventEmitter3()

state({ bus })
const { actions } = action({ bus })
model({ bus })

function view ({ actions }) {
  const increment = event => {
    bus.emit('action', { action: actions.increment })
  }
  return function stateRep ({ state }) {
    console.log('view:', state)
    const nextView = yo`
      <div>
        <div>Model count: ${state.count}</div>
        <button onclick=${increment}>Increment</button>
      </div>`
    yo.update(document.body.firstChild, nextView)
  }
}
document.body.appendChild(yo`<div></div>`)
bus.on('stateRep', view({ actions }))
bus.emit('action', { action: actions.increment, value: 0 })
