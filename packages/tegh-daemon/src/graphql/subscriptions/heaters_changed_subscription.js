import tql from 'typiql'
import HeaterType from '../types/heater_type.js'

const heatersChangedSubscription = () => ({
  // type: tql`[${HeaterType}!]!`,
  type: tql`[${HeaterType}]`,
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
    return pubsub.asyncIterator('heatersChanged')
  },
  resolve(source) {
    return Object.values(source)
  },
})

export default heatersChangedSubscription
