import EventEmitter from 'events'
import throttle from 'just-throttle'
import {
  subscribeToLiveData,
} from 'graphql-live-subscriptions'

const MAX_UPDATE_RATE_MS = 300

const SubscriptionResolvers = {
  Subscription: {
    live: {
      resolve: source => source,
      subscribe: subscribeToLiveData({
        initialState: (source, args, context) => (
          context.store.getState()
        ),
        eventEmitter: (source, args, context) => {
          const eventEmitter = new EventEmitter()
          const { store } = context

          const emitUpdate = () => setImmediate(() => {
            const nextState = store.getState()
            eventEmitter.emit('update', { nextState })
          })

          store.subscribe(throttle(emitUpdate, MAX_UPDATE_RATE_MS))

          return eventEmitter
        },
        sourceRoots: {
          Job: [
            'files',
            'tasks',
            'history',
            'printsCompleted',
            'totalPrints',
            'printsQueued',
            'isDone',
          ],
          JobFile: [
            'tasks',
            'printsCompleted',
            'totalPrints',
            'printsQueued',
            'isDone',
          ],
          Material: [
            'configForm',
          ],
          Plugin: [
            'configForm',
          ],
          Component: [
            'configForm',
            'fan',
            'heater',
          ],
          Task: [
            'printer',
          ],
        },
      }),
    },
  },
}

export default SubscriptionResolvers
