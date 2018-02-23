import tql from 'typiql'

import subscriptionDefaults from '../../utils/subscriptionDefaults'
import LogEntry from '../types/LogEntry.graphql.js'

const logEntryCreatedSubscription = () => ({
  name: 'logEntryCreatedSubscription',
  type: tql`${LogEntry}!`,
  ...subscriptionDefaults('logEntryCreated'),
})

export default {
  subscription: logEntryCreatedSubscription,
  selector: (state) => state.log.get('entries').last(),
}
