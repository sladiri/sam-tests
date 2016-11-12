import morphdom from 'morphdom'
import h from 'hyperscript'

function renderDom (domNode) {
  document.body.children.length === 0
    ? document.body.appendChild(domNode)
    : morphdom(document.body.firstChild, domNode)
}

function pCount ({field}) {
  return h('p.count', field)
}

function button ({disabled}) {
  return h('button', {onclick: ::console.log, disabled}, 'Increment Button')
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

export function onStateRepresentation ({payload}) {
  const {stateRepresentation, model} = payload
  const view = views[stateRepresentation](model)
  if (typeof window === 'undefined') {
    console.log('no DOM', view)
  } else {
    renderDom(view)
  }
  return {
    render: model,
  }
}

export function connect () {
  return {
    stateRepresentation: onStateRepresentation,
  }
}
