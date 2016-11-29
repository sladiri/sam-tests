import morphdom from 'morphdom'
import h from 'hyperscript'
import {getSignal} from '../stomp/bus_stomp'
import * as actions from './actions'

const increment = value => {
  getSignal().then(signal => {
    signal(actions.increment({value}))
  })
}

function renderDom (domNode) {
  document.body.children.length === 0
    ? document.body.appendChild(domNode)
    : morphdom(document.body.firstChild, domNode)
}

function pCount ({field}) {
  return h('p.count', field)
}

function button ({disabled}) {
  return h('button', {
    onclick: e => {
      increment(1)
    },
    disabled,
  }, 'Increment Button')
}

function root ({children}) {
  return h('div#root', ...children)
}

export const views = {
  initial (model) {
    return root({
      children: [
        pCount(model),
        h('br'),
        button(model),
      ],
    })
  },

  danger (model) {
    return root({
      children: [
        pCount(model),
        h('br'),
        button({...model, disabled: true}),
        h('br'),
        h('span.danger', 'DANGER'),
      ],
    })
  },
}

export function onStateRepresentation (payload) {
  const {stateRepresentation, model} = payload
  const view = views[stateRepresentation](model)
  if (typeof window === 'undefined') {
    console.log(`no DOM for state-repesentation: ${stateRepresentation}`)
  } else {
    renderDom(view)
  }
  return {render: null}
}

export function connect () {
  return {state_representation: onStateRepresentation}
}
