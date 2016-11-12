import 'babel-polyfill'
import {stomp} from './bus-stomp'
import {connect} from '../sam/state_representation'

stomp(connect())
