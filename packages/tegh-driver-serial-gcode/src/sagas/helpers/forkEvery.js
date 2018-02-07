import { effects } from 'redux-saga'
const { call, take, fork, cancel } = effects

const forkEvery = (
  patternOrChannel,
  saga,
  ...args
) => call(function*() {
  while(true) {
    const action = yield take(patternOrChannel)
    yield fork(saga, ...args.concat(action))
  }
})

export default forkEvery
