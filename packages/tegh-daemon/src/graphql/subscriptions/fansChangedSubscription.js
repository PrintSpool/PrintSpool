import tql from 'typiql'

import subscriptionDefaults from './helpers/subscriptionDefaults'
import FanType from '../types/fan_type.js'

const heatersChangedSubscription = () => ({
  type: tql`[${FanType}!]!`,
  ...subscriptionDefaults('fansChanged')
})

export default {
  subscription: heatersChangedSubscription,
  selector: (state) => state.driver.fans,
}
