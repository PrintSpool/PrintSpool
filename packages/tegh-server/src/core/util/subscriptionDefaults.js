import { PubSub } from 'graphql-subscriptions'
import tql from 'typiql'

const subscriptionDefaults = (eventNameLookup, options = {}) => ({
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
    /*
     * Proxy the global pubsub through a connection-specific pubsub
     */
    const connectionPubSub = new PubSub()
    pubsub.subscribe(eventName, payload => {
      connectionPubSub.publish(eventName, payload)
    })
    /*
     * allow a connection-specific message to be sent immediately upon
     * subscribing
     */
    if (options.onConnect != null) {
      setImmediate(() => options.onConnect({
        args,
        store,
        pubsub: connectionPubSub,
      }))
    }

    return connectionPubSub.asyncIterator(eventName)
  },
  resolve(source) {
    return source
  },
})

export default subscriptionDefaults
