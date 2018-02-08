import { effects } from 'redux-saga'
const { call, take, fork, cancel, race } = effects

const forkLatest = (
  patternOrChannel,
  saga,
  ...args
) => call(function*() {
  const takeNext = take(patternOrChannel)
  let action = yield takeNext
  while (true) {
    const { nextAction } = yield race({
      worker: call(saga, ...args.concat(action)),
      nextAction: takeNext,
    })
    // The worker completed successfully. Wait for another action
    if (nextAction == null) {
      action = yield takeNext
    // The next action was received before the worker completed (killing the
    // worker)
    } else {
      action = nextAction
    }
  }
})

export default forkLatest
