import { useState } from 'react'
import { useSubscription } from 'react-apollo-hooks'
import jsonpatch from 'json-patch'

const useLiveSubscription = (subscription, options = {}) => {
  const [state, setState] = useState()

  const onSubscriptionData = (event) => {
    const { query, patch } = event.subscriptionData.data.live
    let nextState = state

    if (query != null) {
      nextState = query
    }

    if (patch != null) {
      patch.forEach((patchOp) => {
        nextState = jsonpatch.apply(nextState, patchOp)
      })
    }

    setState(nextState)

    if (options.onSubscriptionData != null) {
      options.onSubscriptionData({
        ...options,
        subscriptionData: {
          data: nextState,
        },
      })
    }
  }

  const { error, loading } = useSubscription(subscription, {
    ...options,
    onSubscriptionData,
  })

  return {
    error,
    loading,
    data: state,
  }
}

export default useLiveSubscription
