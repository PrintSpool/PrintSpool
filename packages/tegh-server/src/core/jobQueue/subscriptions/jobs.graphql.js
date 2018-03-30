import tql from 'typiql'
import immutablediff from 'immutablediff'

import Live from '../../../../../graphql-live-subscription/src/GraphQLLiveSubscription'

import subscriptionDefaults from '../../util/subscriptionDefaults'
import JobGraphQL from '../types/Job.graphql.js'

const eventName = 'jobsChanged'

const selector = state => state.jobQueue.jobs.toList()

const liveJob = () => Live({
  name: 'LiveJob',
  type: tql`[${JobGraphQL}!]`,
})

const jobs = () => ({
  name: 'jobs',
  type: tql`${liveJob()}!`,
  ...subscriptionDefaults(eventName, {
    onConnect: ({ store, pubsub }) => {
      /* immediately return the query results upon connection */
      const data = {
        query: selector(store.getState()),
      }
      pubsub.publish(eventName, data)
    },
  }),
  resolve(source) {
    console.log(JSON.stringify(source))
    return source
  },
})

export default {
  subscription: jobs,
  selector,
  onSelectorChange: ({ newVal, oldVal, pubsub }) => {
    const data = {
      patches: immutablediff(oldVal, newVal).toJSON(),
    }
    pubsub.publish(eventName, data)
  },
}
