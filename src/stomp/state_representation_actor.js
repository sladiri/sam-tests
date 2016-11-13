import 'babel-polyfill'
import {stompActor} from './bus-stomp'
import {connect} from '../sam/state_representation'

stompActor(connect())
