import EventEmitter from 'events'
import _ from 'lodash'
import {
  subscribeToLiveData,
} from 'graphql-live-subscriptions'

const MAX_UPDATE_RATE_MS = 500

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

          store.subscribe(_.throttle(emitUpdate, MAX_UPDATE_RATE_MS))

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
          PrinterConfig: [
            'fixedListComponentTypes',
          ],
          Component: [
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
