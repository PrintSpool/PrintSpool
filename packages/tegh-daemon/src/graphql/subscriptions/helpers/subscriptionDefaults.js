import tql from 'typiql'

const subscriptionDefaults = (eventName) => ({
  args: {
    printerID: {
      type: tql`ID!`,
    },
  },
  subscribe(_source, args, { store, pubsub }) {
    const state = store.getState()
    if (args.printerID !== state.config.id) {
      throw new Error(`Printer ID ${args.id} does not exist`)
    }
    return pubsub.asyncIterator(eventName)
  },
  resolve(source) {
    return source
  },
})

export default subscriptionDefaults
