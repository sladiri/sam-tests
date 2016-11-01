import test from 'tape'
import { model, actions } from './counter'


test('model aborts increment actions after field reaches five', function (t) {
  [1, 2, 3, 4, 5, 6].forEach(() => actions.increment())
  t.equal(5, model.field)
})
