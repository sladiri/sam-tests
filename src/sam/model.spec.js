import test from 'tape'
import p from 'jsverify'
import {model} from './model'

test('model sets initial state', t => {
  const toTest = model({ field: 0 })
  t.equal(toTest({}).model.field, 0)
  t.end()
})

test('model count increments positive proposal', t => {
  const toTest = model({ field: 0 })
  const check = p.forall(p.integer(), n => {
    const previous = toTest({}).model.field
    const current = toTest({proposal: n}).model.field
    return n > 0
      ? current === n + previous
      : current === previous
  })
  t.equal(p.check(check), true)
  t.end()
})
