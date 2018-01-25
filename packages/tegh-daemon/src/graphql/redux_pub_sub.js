import _ from 'lodash'
import watch from 'redux-watch'
import { PubSub } from 'graphql-subscriptions'

import * as subscriptionModules from './subscriptions'

const reduxPubSub = (store, selectors) => {
  const pubsub = new PubSub()
  // assuming mySelector is a reselect selector defined somewhere
  Object.entries(selectors).forEach(([eventName, selector]) => {
    const w = watch(() =>
      selector(store.getState())
    )
    store.subscribe(w((newVal) => {
      pubsub.publish(eventName, newVal)
    }))
  })
  return pubsub
}

export default (store) => {
  const selectors = _.mapValues(subscriptionModules, m => m.selector)
  return reduxPubSub(store, selectors)
}
