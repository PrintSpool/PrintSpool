import React, { useState } from 'react'
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
  const ChildComponent = children[0] || children
  const key = 'live'

  const [state, setState] = useState()

  return (
    <Subscription
      subscription={subscription}
      variables={variables}
      onSubscriptionData={(options) => {
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
      }}
    >
      {
        ({ loading, error }) => (
          <ChildComponent
            data={state}
            loading={loading}
            error={error}
          />
        )
      }
    </Subscription>
  )
}
