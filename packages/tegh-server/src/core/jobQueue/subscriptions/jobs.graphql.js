import tql from 'typiql'

import {
  GraphQLLiveData,
  subscribeToLiveData,
} from '../../../../../graphql-live-subscription/src/index'

import JobGraphQL from '../types/Job.graphql.js'

const selector = state => state.jobQueue.jobs.toList()

const liveJob = GraphQLLiveData({
  name: 'LiveJob',
  type: () => tql`[${JobGraphQL}!]`,
})

const type = tql`${liveJob}!`

const jobs = () => ({
  type,

  subscribe: subscribeToLiveData({
    type,
    getSubscriptionProvider: async (args, context, resolveInfo) => {
      return context.store
    },
    updateSource: async (args, context, resolveInfo) => {
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
