const DELAY_FROM_GREETING_TO_READY = 2500

const spoolTemperatureQueryAction = () => ({
  type: 'SPOOL',
  spoolID: 'internalSpool',
  data: 'M105',
})

/*
 * Intercepts SERIAL_RECEIVE actions, parses their data (appending it
 * as `action.parsedData`) and dispatches actions.
 *
 * - dispatches PRINTER_READY and SPOOL once the printer is booted
 * - dispatches SPOOL for temperature polling.
 * - dispatches DESPOOL on acknowledgment of previous line.
 * - dispatches SERIAL_SEND to resend the previous line if the printer
 *   requests a resend.
 *
 * SERIAL_RECEIVE actions are appended to:
 *  {
 *    data: STRING // raw gcode
 *    parsedData: RxParserParsedData // see rx_parser
 *  }
 */
const rxMiddleware  = ({rxParser, timeoutFns = global}) => store => {
  const {setTimeout, cancelTimeout} = timeoutFns
  const timeouts = {}

  /*
   * After a greeting is received from the printer the middleware waits
   * DELAY_FROM_GREETING_TO_READY to declare the printer ready to receive
   * gcodes
   *
   * Temperature polling also begins at that time.
   */
  const onReady = () => {
    store.dispatch({
     type: 'PRINTER_READY',
    })
    store.dispatch(spoolTemperatureQueryAction())
  }

  const onGreeting = () => {
    action.readyTimeoutID = setTimeout(
      onReady,
      DELAY_FROM_GREETING_TO_READY
    )
  }

  const pollForTemperature = () => {
    if (timeouts.temperature != null) cancelTimeout(timeouts.temperature)
    const spoolQuery = () => store.dispatch(spoolTemperatureQueryAction())
    timeouts.temperature = setTimeout(
      spoolQuery,
      store.getState().config.temperaturePollingInterval
    )
  }

  const onGreeting = () => {
    store.dispatch({
      type: 'SET_TIMEOUT',
      fn: onReady,
      timeout: DELAY_FROM_GREETING_TO_READY
    })
  }

  const pollForTemperature = () => {
    store.dispatch({
      type: 'SET_TIMEOUT',
      fn: spoolTemperatureQueryAction,
      timeout: store.getState().config.temperaturePollingInterval
    })
  }

  return next => action => {
    if (action.type !== 'SERIAL_RECEIVE') return next(action)
    const state = store.getState()
    const parsedData = rxParser(action.data, {ready: state.ready})
    next({
      ...action,
      parsedData,
    })

    if (parsedValue.isGreeting) {
      onGreeting()
    }
    if (parsedValue.isAck) {
      if (action.parsedData.temperatures != null) {
        pollForTemperature()
      }
      store.dispatch({
        type: 'DESPOOL',
      })
    } if (parsedValue.isResend) {
      store.dispatch({
        type: 'SERIAL_SEND',
        data: store.getState().spool.currentLine
      })
    }
  }
}

export default rxMiddleware
