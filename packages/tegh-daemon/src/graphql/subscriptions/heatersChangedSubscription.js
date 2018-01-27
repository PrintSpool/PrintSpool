import tql from 'typiql'

import subscriptionDefaults from './helpers/subscriptionDefaults'
import HeaterType from '../types/heater_type.js'

const heatersChangedSubscription = () => ({
  name: 'heatersChangedSubscription',
  type: tql`[${HeaterType}!]!`,
  ...subscriptionDefaults('heatersChanged')
})

export default {
  subscription: heatersChangedSubscription,
  selector: (state) => state.driver.heaters,
}
