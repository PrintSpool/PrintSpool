import _ from 'lodash'
import tql from 'typiql'

import {
  GraphQLLiveData,
  subscribeToLiveData,
} from 'graphql-live-subscriptions'

import JobGraphQL from '../types/Job.graphql.js'

const RESPONSE_THROTTLE_MS = 500

const selector = state => state.jobQueue.jobs.toList()

const type = () => tql`[${JobGraphQL}!]`

const jobs = () => ({
  type: GraphQLLiveData({
    name: 'LiveJob',
    type,
  }),

  subscribe: subscribeToLiveData({
    type,
    getSubscriptionProvider: async (source, args, context, resolveInfo) => {
      return {
        subscribe: cb => {
          return context.store.subscribe(_.throttle(cb, RESPONSE_THROTTLE_MS))
        }
      }
    },
    getSource: async (originalSource, args, context, resolveInfo) => {
      const state = context.store.getState()
      return selector(state).toJS()
    },
  }),

  resolve(source) {
    // console.log(JSON.stringify(source))
    return source
  },
})

export default {
  subscription: jobs,
  selector,
}
