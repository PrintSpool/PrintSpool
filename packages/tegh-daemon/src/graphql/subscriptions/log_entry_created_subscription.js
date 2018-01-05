import tql from 'typiql'
import LogEntry from '../types/log_entry_type.js'

const logEntryCreatedSubscription = () => ({
  // type: tql`[${LogEntry}!]!`,
  type: tql`${LogEntry}!`,
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
    return pubsub.asyncIterator('logEntryCreated')
  },
  resolve(_source, args, { store }) {
    return store.getState().log.get('entries').last()
  },
})

export default logEntryCreatedSubscription
