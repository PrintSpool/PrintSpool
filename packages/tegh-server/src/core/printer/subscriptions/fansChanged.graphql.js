import tql from 'typiql'

import subscriptionDefaults from '../../utils/subscriptionDefaults'
import FanType from '../types/Fan.graphql.js'

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
