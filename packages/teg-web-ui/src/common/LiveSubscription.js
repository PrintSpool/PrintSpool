import React, { useState, useCallback } from 'react'
import { Subscription } from 'react-apollo'
import jsonpatch from 'json-patch'

// eslint-disable-next-line import/prefer-default-export
export const LiveSubscription = ({
  variables,
  subscription,
  onSubscriptionData,
  children,
}) => {
  if (children.length !== 1) {
    throw new Error('LiveSubscription must have 1 child component')
  }
  const key = 'live'

  const [state, setState] = useState()

  const internalOnSubscriptionData = useCallback((options) => {
    const { data } = options.subscriptionData
    let nextState = state

    if (data != null) {
      const { query, patch } = data[key]

      if (query != null) nextState = query

      if (patch != null) {
        patch.forEach((patchOp) => {
          nextState = jsonpatch.apply(nextState, patchOp)
        })
      }

      setState(nextState)
    }

    if (onSubscriptionData != null) {
      onSubscriptionData({
        ...options,
        subscriptionData: {
          data: nextState,
        },
      })
    }
  })

  return (
    <Subscription
      subscription={subscription}
      variables={variables}
      onSubscriptionData={internalOnSubscriptionData}
    >
      {
        useCallback(({ loading, error }) => (
          children({
            data: state,
            loading,
            error,
          })
        ), [children, state])
      }
    </Subscription>
  )
}
