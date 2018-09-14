import tql from 'typiql'

import subscriptionDefaults from '../../util/subscriptionDefaults'
import HeaterType from '../types/Heater.graphql'

const heatersChangedSubscription = () => ({
  name: 'heatersChanged',
  type: tql`[${HeaterType}!]!`,
  ...subscriptionDefaults('heatersChanged'),
  resolve(source) {
    return Object.values(source)
  },
})

export default {
  subscription: heatersChangedSubscription,
  selector: state => state.driver.heaters,
}
