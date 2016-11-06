import 'babel-polyfill'
import yo from 'yo-yo'
import { actions as _actions, state, dispatch, model } from './counter'
import EventEmitter3 from 'eventemitter3'

const bus = new EventEmitter3()
const { actions } = _actions({ bus })
model({ bus })
state({ bus, actions })
dispatch({ bus, actions })

function view ({ state, incremented }) {
  console.log('view:', state)
  const increment = event => {
    bus.emit('action', {
      action: incremented,
      count: state.count + 1,
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
  bus.emit('render')
}
document.body.appendChild(yo`<div></div>`)
bus.on('stateRep', view)
bus.emit('action', { action: actions.reset, sync: true })
