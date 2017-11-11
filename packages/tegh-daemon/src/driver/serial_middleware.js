const serialMiddleware = (serialPort) => (store) => {
  const onOpen = (err) => {
      store.dispatch({
        type: 'SERIAL_OPEN'
      })
  }

  const onData = (data) => {
    store.dispatch({
      type: 'SERIAL_RECEIVE',
      data
    })
  }

  const onError = (error) => {
    store.dispatch({
      type: 'SERIAL_ERROR',
      error,
    })
  }

  serialPort
    .on('open', onOpen)
    .on('data', onData)
    .on('error', onError)

  serialPort.open()

  return next => action => {
    if (action.type === 'SERIAL_SEND') {
      serialPort.write(action.data, (err) => {
        if (err) onError(err)
      })
    }
    return next(action)
  }
}

export default serialMiddleware
