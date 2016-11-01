import yo from 'yo-yo'
import style from './counter.css'

export const model = {
  field: 0,
  accept ({ value }) {
    if (value === null) {
      this.field = 0
    } else {
      this.field += 1
    }
    state(model)
  },
}
const state = (model) => {
  // forbid increment
  actions.blockIncrement = model.field >= 5
  const nextView = view({ counter: model.field, action: () => actions.increment() })
  render({ nextView }) // TODO: NAP first?
  nap({ model })
}
const nap = ({ model }) => {
  if (model.field >= 5) {
    actions.reset()
  }
}
export const actions = {
  blockIncrement: null,
  increment () {
    if (!this.blockIncrement) {
      model.accept({})
    } else {
    }
  },
  reset () {
    setTimeout(() => {
      model.accept({ value: null })
    }, 3000)
  },
}
const view = ({ counter, action }) => {
  return yo`
    <div class="${style[`counter${counter}`]}">
      ${counter}
      <br />
      <button onclick=${action}>increment</button>
    </div>`
}
const render = ({ nextView }) => {
  if (!initialView) {
    initialView = nextView
    document.body.appendChild(initialView)
  } else {
    yo.update(initialView, nextView)
  }
}
let initialView
state(model)
