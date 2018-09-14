import tql from 'typiql'

import subscriptionDefaults from '../../util/subscriptionDefaults'
import PrinterType from '../types/Printer.graphql'

const statusChangedSubscription = () => ({
  name: 'statusChanged',
  type: tql`${PrinterType}!`,
  ...subscriptionDefaults('statusChanged'),
  resolve(_source, _args, { store }) {
    return store.getState()
  },
})

export default {
  subscription: statusChangedSubscription,
  selector: state => state.driver.status,
}
