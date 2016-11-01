import yo from 'yo-yo'
import { first as oneStyle } from './styles/first.css'
import { second as twoStyle } from './styles/second.css'


document.body.appendChild(yo`<div>Hello</div>`)
const { map } = Array.prototype
document.querySelectorAll('div')
  ::map(node => do {
    node.innerHTML = node.innerHTML + ' World!'
    node.className = oneStyle
  })
document.body.appendChild(yo`<div class="${twoStyle}">A Test</div>`)
