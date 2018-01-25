import tql from 'typiql'

import subscriptionDefaults from './helpers/subscriptionDefaults'
import LogEntry from '../types/log_entry_type.js'

const logEntryCreatedSubscription = () => ({
  type: tql`${LogEntry}!`,
  ...subscriptionDefaults('logEntryCreated'),
})

export default {
  subscription: logEntryCreatedSubscription,
  selector: (state) => state.log.get('entries').last(),
}
