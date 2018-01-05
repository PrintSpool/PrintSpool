import watch from 'redux-watch'
import { PubSub } from 'graphql-subscriptions'

const reduxPubSub = (store, selectors) => {
  const pubsub = new PubSub()
  // assuming mySelector is a reselect selector defined somewhere
  for ([eventName, selector] of Object.entries(selectors)) {
    let w = watch(() => selector(store.getState()))
    store.subscribe(w((newVal) => {
      pubsub.publish(eventName, newVal)
    }))
  }
  return pubsub
}

export default (store) => {
  const selectors = {
    heatersChanged: (state) => state.driver.heaters,
    logEntryCreated: (state) => state.log.get('entryCountSinceStartup'),
  }

  return reduxPubSub(store, selectors)
}
