import tql from 'typiql'

import subscriptionDefaults from './helpers/subscriptionDefaults'
import PrinterType from '../types/printer_type.js'

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
