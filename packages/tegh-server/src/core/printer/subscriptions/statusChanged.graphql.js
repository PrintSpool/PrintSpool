import tql from 'typiql'

import subscriptionDefaults from '../../utils/subscriptionDefaults'
import PrinterType from '../types/Printer.graphql.js'

const statusChangedSubscription = () => ({
  name: 'statusChangedSubscription',
  type: tql`${PrinterType}!`,
  ...subscriptionDefaults('statusChanged'),
  resolve(_source, _args, { store }) {
    return store.getState()
  },
})

export default {
  subscription: statusChangedSubscription,
  selector: (state) => state.driver.status,
}
