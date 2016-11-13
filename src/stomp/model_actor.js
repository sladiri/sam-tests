import 'babel-polyfill'
import {stompActor} from './bus-stomp'
import {connect} from '../sam/model'

stompActor(connect())
