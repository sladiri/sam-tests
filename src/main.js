import yo from 'yo-yo'
import styles from './styles/main.css'

console.log('hooha', styles)

document.body.appendChild(yo`<div class="${styles.world}">Hello</div>`)

const { map } = Array.prototype
document.querySelectorAll('div')
  ::map(node => do { node.innerHTML = node.innerHTML + ' World!' })
