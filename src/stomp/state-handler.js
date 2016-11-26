import {stompConnect} from './bus_stomp'
import {connect} from '../sam/state'

stompConnect(connect())
