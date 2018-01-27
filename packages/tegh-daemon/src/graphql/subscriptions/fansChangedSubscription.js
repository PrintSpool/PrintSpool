import tql from 'typiql'

import subscriptionDefaults from './helpers/subscriptionDefaults'
import FanType from '../types/fan_type.js'

const fansChangedSubscription = () => ({
  name: 'fansChangedSubscription',
  type: tql`[${FanType}!]!`,
  ...subscriptionDefaults('fansChanged')
})

export default {
  subscription: fansChangedSubscription,
  selector: (state) => state.driver.fans,
}
