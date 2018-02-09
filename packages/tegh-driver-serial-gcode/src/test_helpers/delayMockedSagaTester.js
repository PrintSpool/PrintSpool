import SagaTester from 'redux-saga-tester'
import sagaDelayMock from 'redux-saga-delay-mock'

const delayMockedSagaTester = ({ initialState = {}, saga, options = {} }) => {
  // TODO: see https://github.com/redux-saga/redux-saga/issues/1295
  const delayMock = sagaDelayMock()
  const sagaTester = new SagaTester({
    initialState,
    options: {
      effectMiddlewares: [delayMock],
      ...options,
    },
  })
  sagaTester.start(saga)
  return { sagaTester, delayMock }
}

export default delayMockedSagaTester
