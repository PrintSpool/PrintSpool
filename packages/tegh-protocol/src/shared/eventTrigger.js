import Promise from 'bluebird'

const eventTrigger = (eventEmitter, eventName, {
  map = result => result,
  filter = () => true,
}) => (
  new Promise((resolve, reject) => {
    const eventListener = async (result) => {
      let mappedResult = map(result)
      if (mappedResult.then != null) {
        mappedResult = await mappedResult
      }
      if (filter(mappedResult)) {
        eventEmitter.removeListener(eventName, eventListener)
        resolve(mappedResult)
      }
    }

    eventEmitter.on(eventName, eventListener)
  })
)

export const signalTrigger = (rtcPeer, signalName) => (
  eventTrigger(rtcPeer, 'signal', {
    filter: signal => signal.type === signalName,
  })
)

export default eventTrigger
