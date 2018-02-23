import tql from 'typiql'

import subscriptionDefaults from './helpers/subscriptionDefaults'
import FanType from '../types/fan_type.js'

const fansChangedSubscription = () => ({
  name: 'fansChangedSubscription',
  type: tql`[${FanType}!]!`,
  ...subscriptionDefaults('fansChanged'),
  resolve(source) {
    return Object.values(source)
  },
})

export default {
  subscription: fansChangedSubscription,
  selector: (state) => state.driver.fans,
}
