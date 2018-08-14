import { loop, Cmd } from 'redux-loop'
import { estop } from 'tegh-server'

const eStopSaga = (state, action) => {
  switch (action) {
    case SERIAL_SEND: {
      /*
       * Trigger an eStop action on M112 to emergency stop all of Tegh
       */
      if (code === 'M112') {
        return loop(state, Cmd.action(estop()))
      }
      /*
       * eStops require a reset of the serial connection
       * to restart the printer so we automatically do this for all M999s just to
       * be safe.
       */
      if (code === 'M999') {
        return loop(state, Cmd.action({
          type: SERIAL_RESET,
        }))
      }
      return state
    }
    default: {
      return state
    }
  }
}

export default eStopSaga
