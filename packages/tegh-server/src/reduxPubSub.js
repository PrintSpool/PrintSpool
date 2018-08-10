import _ from 'lodash'
import watch from 'redux-watch'
import { PubSub } from 'graphql-subscriptions'

import * as subscriptionModules from './core/subscriptions'

const reduxPubSub = (store, subscriptionModules) => {
  const pubsub = new PubSub()
  // assuming mySelector is a reselect selector defined somewhere
  Object.entries(subscriptionModules).forEach((entry) => {
    const [eventName, subscriptionModule] = entry
    const {
      selector,
      onSelectorChange,
    } = subscriptionModule
    const w = watch(() => selector(store.getState()))
    store.subscribe(w((newVal, oldVal) => {
      if (onSelectorChange == null) {
        pubsub.publish(eventName, newVal)
      } else {
        onSelectorChange({ newVal, oldVal, pubsub })
      }
    }))
  })
  return pubsub
}

export default store => reduxPubSub(store, subscriptionModules)
