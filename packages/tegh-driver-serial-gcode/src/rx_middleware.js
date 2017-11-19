const spoolTemperatureQueryAction = () => ({
  type: 'SPOOL',
  spoolID: 'internalSpool',
  data: 'M105',
})

/*
 * Intercepts SERIAL_RECEIVE actions, parses their data (appending it
 * as `action.parsedData`) and dispatches actions.
 *
 * - dispatches SPOOL for temperature polling.
 * - dispatches DESPOOL on acknowledgment of previous line.
 * - dispatches SERIAL_SEND to resend the previous line if the printer requests
 *   a resend.
 *
 * SERIAL_RECEIVE actions are appended to:
 *  {
 *    data: STRING // raw gcode
 *    parsedData: RxParserParsedData // see rx_parser
 *  }
 */
const rxMiddleware  = (globals) => store => {
  const {setTimeout, cancelTimeout} = globals
  const timeouts = {}

  /*
   * After a greeting is received from the printer the middleware waits
   * DELAY_FROM_GREETING_TO_READY to declare the printer ready to receive gcodes
   *
   * Temperature polling also begins at that time.
   */
  const onGreeting = () => {
    onReady = () => {
      store.dispatch({
        type: 'PRINTER_READY',
      })
      store.dispatch(spoolTemperatureQueryAction())
    }
    action.readyTimeoutID = setTimeout(onReady, DELAY_FROM_GREETING_TO_READY)
  }

  const pollForTemperature = () => {
    if (timeouts.temperature != null) cancelTimeout(timeouts.temperature)
    const spoolQuery = () => store.dispatch(spoolTemperatureQueryAction())
    timeouts.temperature = setTimeout(
      spoolQuery,
      store.getState().config.temperaturePollingInterval
    )
  }

  return next => action => {
    if (action.type === 'SERIAL_RECEIVE') {
      const state = store.getState()
      const parsedData = parser(action.data, {ready: state.ready})
      next({
        ...action,
        parsedData,
      })

      if (parsedValue.isGreeting) {
        onGreeting()
      }
      if (parsedData.includesTemperatureValues) {
        pollForTemperature()
      }
      if (parsedValue.isAck) {
        store.dispatch({
          type: 'DESPOOL',
        })
      } else if (parsedValue.isResend) {
        store.dispatch({
          type: 'SERIAL_SEND',
          data: store.getState().spool.currentLine
        })
      }
    } else {
      next(action)
    }
  }
}

export default rxMiddleware
