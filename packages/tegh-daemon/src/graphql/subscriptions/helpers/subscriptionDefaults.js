import tql from 'typiql'

const subscriptionDefaults = (eventNameLookup) => ({
  args: {
    printerID: {
      type: tql`ID!`,
    },
  },
  subscribe(_source, args, { store, pubsub }) {
    const eventName = (() => {
      switch(typeof eventNameLookup) {
        case 'string': {
          return eventNameLookup
        }
        case 'function': {
          return eventNameLookup(args)
        }
        default: {
          throw new Error(
            'subscriptionDefaults must be passed either string or a function'
          )
        }
      }
    })()
    const state = store.getState()
    if (args.printerID !== state.config.id) {
      throw new Error(`Printer ID ${args.id} does not exist`)
    }
    pubsub.asyncIterator(eventName)
  },
  resolve(source) {
    return source
  },
})

export default subscriptionDefaults
