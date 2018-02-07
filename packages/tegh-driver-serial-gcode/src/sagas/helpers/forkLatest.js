import { effects } from 'redux-saga'
const { call, take, fork, cancel } = effects

const forkLatest = (
  patternOrChannel,
  saga,
  ...args
) => call(function*() {
  let lastTask
  while (true) {
    const action = yield take(patternOrChannel)
    if (lastTask) {
      yield cancel(lastTask) // cancel is no-op if the task has already terminated
    }
    lastTask = yield fork(saga, ...args.concat(action))
  }
})

export default forkLatest
