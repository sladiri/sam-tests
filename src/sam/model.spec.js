import test from 'tape'
import p from 'jsverify'
import {model} from './model'

const getModel = (state) => model(state || {field: 0})

test('model sets initial state', t => {
  const propose = getModel()
  t.equal(propose({}).model.field, 0)
  t.end()
})

test('model count increments positive proposal', t => {
  const propose = getModel()
  const check = p.forall(p.integer(), n => {
    const previous = propose({}).model.field
    const current = propose({field: n}).model.field
    return n > 0
      ? current === n + previous
      : current === previous
  })
  t.equal(p.check(check), true)
  t.end()
})
