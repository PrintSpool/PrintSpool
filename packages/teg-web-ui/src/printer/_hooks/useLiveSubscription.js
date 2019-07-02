import { useState, useEffect } from 'react'
import { useSubscription } from 'react-apollo-hooks'
import jsonpatch from 'json-patch'

const useLiveSubscription = (subscription, options = {}) => {
  const [counter, setRenderCounter] = useState(0)
  const [state, setState] = useState()

  /*
   * A promise to emulate React.lazy and trigger React.suspension while
   * the initial query response loads.
   */
  const [suspension] = useState(() => {
    const initialSuspension = {}
    initialSuspension.promise = new Promise((resolve, reject) => {
      initialSuspension.resolve = resolve
      initialSuspension.reject = reject
    })

    return initialSuspension
  })

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
    // force a re-render for each response
    setRenderCounter(counter + 1)

    if (options.onSubscriptionData != null) {
      options.onSubscriptionData({
        ...options,
        subscriptionData: {
          data: nextState,
        },
      })
    }

    if (query != null) {
      suspension.resolve()
    }
  }

  const { error } = useSubscription(subscription, {
    ...options,
    onSubscriptionData,
  })

  useEffect(() => {
    if (error != null) {
      suspension.resolve()
    }
  }, [error])

  const loading = state == null && error == null

  // if (loading) {
  //   throw suspension.promise
  // }

  return {
    error,
    loading,
    data: state,
    suspensionPromise: suspension.promise,
  }
}

export default useLiveSubscription
