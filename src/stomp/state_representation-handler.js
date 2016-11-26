import {stompConnect} from './bus_stomp'
import {connect} from '../sam/state_representation'

stompConnect(connect())
