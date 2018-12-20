import Promise from 'bluebird'

const eventTrigger = (eventEmitter, eventName, {
  map = result => result,
  filter = () => true,
}) => (
  new Promise((resolve) => {
    const useBrowerAPI = eventEmitter.addEventListener != null
    const ADD = useBrowerAPI ? 'addEventListener' : 'on'
    const REMOVE = useBrowerAPI ? 'removeEventListener' : 'removeListener'

    const eventListener = async (result) => {
      let mappedResult = map(result)

      if (mappedResult.then != null) {
        mappedResult = await mappedResult
      }

      if (filter(mappedResult)) {
        eventEmitter[REMOVE](eventName, eventListener)
        resolve(mappedResult)
      }
    }

    eventEmitter[ADD](eventName, eventListener)
  })
)

export default eventTrigger
