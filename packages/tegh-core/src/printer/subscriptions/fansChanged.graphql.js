import tql from 'typiql'

import subscriptionDefaults from '../../util/subscriptionDefaults'
import FanType from '../types/Fan.graphql'

const fansChangedSubscription = () => ({
  name: 'fansChanged',
  type: tql`[${FanType}!]!`,
  ...subscriptionDefaults('fansChanged'),
  resolve(source) {
    return Object.values(source)
  },
})

export default {
  subscription: fansChangedSubscription,
  selector: state => state.driver.fans,
}
