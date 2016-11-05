import yo from 'yo-yo'
import { model } from './counter'

const stateRep = (model) => {
  return yo`<div>Hello World!</div>`
}

const display = (view) => {
  yo.update(document.body, view)
}

document.body.appendChild(yo`<div></div>`)
const counter = model(stateRep, display)
counter.accept()
