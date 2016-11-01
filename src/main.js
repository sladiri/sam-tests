import yo from 'yo-yo'
import mainStyles from './styles/main.css'
import secondStyles from './styles/second.css'

console.log('foo', mainStyles, secondStyles)

document.body.appendChild(yo`<div class="${mainStyles.world}">Hello</div>`)

const { map } = Array.prototype
document.querySelectorAll('div')
  ::map(node => do { node.innerHTML = node.innerHTML + ' World!' })

document.body.appendChild(yo`<div class="${secondStyles.hello}">A Test</div>`)
