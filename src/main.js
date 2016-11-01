import yo from 'yo-yo'
import style from './main.css'

const model = {
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
  const action = () => actions.increment()
  const disabled = model.field >= 5
  actions.blockIncrement = disabled
  const nextView = view({ counter: model.field, action, disabled })
  nap({ model })
  render({ nextView }) // TODO: NAP first?
}
const nap = ({ model }) => {
  if (model.field >= 5) {
    actions.reset()
  }
}
const actions = {
  blockIncrement: null,
  increment () {
    setTimeout(() => {
      if (!this.blockIncrement) {
        model.accept({})
      } else {
      }
    }, 1000)
  },
  reset () {
    setTimeout(() => {
      model.accept({ value: null })
    }, 3000)
  },
}
const view = ({ counter, action, disabled }) => {
  return yo`
    <div class="${style[`counter${counter}`]}">
      ${counter}
      <br />
      <button disabled=${disabled} onclick=${action}>increment</button>
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
