import tql from 'typiql'

import subscriptionDefaults from '../../util/subscriptionDefaults'
import HeaterType from '../types/Heater.graphql.js'

const heatersChangedSubscription = () => ({
  name: 'heatersChangedSubscription',
  type: tql`[${HeaterType}!]!`,
  ...subscriptionDefaults('heatersChanged'),
  resolve(source) {
    return Object.values(source)
  },
})

export default {
  subscription: heatersChangedSubscription,
  selector: (state) => state.driver.heaters,
}
