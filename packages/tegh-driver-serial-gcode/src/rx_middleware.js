/*
 * Intercepts SERIAL_RECEIVE actions, parses their data (appending it
 * as `action.parsedData`) and dispatches actions.
 *
 * - dispatches SPOOL for temperature polling.
 * - dispatches DESPOOL on acknowledgment of previous line.
 * - dispatches SERIAL_SEND to resend the previous line if the printer requests
 *   a resend.
 */
const rxMiddleware  = store => next => action => {

  if (action.type === 'SERIAL_RECEIVE') {
    // TODO: poll for temperature
    // const previousTimestamp = store.getState()._temperatureLastUpdated
    // next(action)
    // previousTimestamp < store.getState()._temperatureLastUpdated
    // TODO: send despool actions
    const parsedValues = parser(action.data)
    if (parsedValues.includesTemperatureValues) {
      setTimeout(() =>
        store.dispatch({
          type: 'SPOOL',
          spoolID: 'internalSpool',
          data: '', // TODO read temperature or whatever
        })
      , config.temperaturePollingInterval)
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

export default rxMiddleware
