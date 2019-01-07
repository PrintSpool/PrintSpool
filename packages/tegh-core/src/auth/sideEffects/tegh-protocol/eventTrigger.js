import Promise from 'bluebird'

const eventTrigger = (eventEmitter, eventName, {
  map = result => result,
  filter = () => true,
}) => (
  new Promise((resolve, reject) => {
    const useBrowerAPI = eventEmitter.addEventListener != null
    const ADD = useBrowerAPI ? 'addEventListener' : 'on'
    const REMOVE = useBrowerAPI ? 'removeEventListener' : 'removeListener'

    const errorListener = (error) => {
      reject(error)
    }
    const eventListener = async (result) => {
      let mappedResult = map(result)

      if (mappedResult.then != null) {
        mappedResult = await mappedResult
      }

      if (filter(mappedResult)) {
        eventEmitter[REMOVE]('error', errorListener)
        eventEmitter[REMOVE](eventName, eventListener)
        resolve(mappedResult)
      }
    }

    eventEmitter[ADD]('error', errorListener)
    eventEmitter[ADD](eventName, eventListener)
  })
)

export default eventTrigger
