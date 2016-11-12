import 'babel-polyfill'
import {stomp} from './bus-stomp'
import {connect} from '../sam/state'

stomp(connect())
