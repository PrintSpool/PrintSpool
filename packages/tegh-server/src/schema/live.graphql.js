import EventEmitter from 'events'
import {
  GraphQLLiveData,
  subscribeToLiveData,
} from 'graphql-live-subscriptions/src/index'

import QueryRootGraphQL from './QueryRoot.graphql'

const type = () => QueryRootGraphQL

const LiveSubscriptionRoot = () => GraphQLLiveData({
  name: 'LiveSubscriptionRoot',
  type,
})

const liveGraphQL = () => ({
  type: LiveSubscriptionRoot(),
  resolve: source => source,
  subscribe: subscribeToLiveData({
    initialState: (source, args, context) => (
      context.store.getState()
    ),
    eventEmitter: (source, args, context) => {
      const eventEmitter = new EventEmitter()
      const { store } = context

      store.subscribe(() => {
        const nextState = store.getState()
        eventEmitter.emit('update', { nextState })
      })

      return eventEmitter
    },
  }),
})

export default liveGraphQL
