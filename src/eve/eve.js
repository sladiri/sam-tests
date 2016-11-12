import {views} from './state_representation'
const testView = views.initial({
  field: 42,
})

import {init, createAgent} from './bus-eve'
import {msg} from './message'
init()
const t11 = createAgent({from: 't11', handler: () => []})
const t22 = createAgent({from: 't22', handler: () => []})
t11.send('t22', msg({payload: testView}))
