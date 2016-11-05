import test from 'tape'
import { model } from './counter'

const setup = () => {
  return model(() => {}, () => {})
}

test('model count starts with 0', t => {
  const fixture = setup()
  t.equal(fixture.state.count, 0)
  t.end()
})
