import {stompConnect} from './bus_stomp'
import {connect} from '../sam/model'

stompConnect(connect())
