import React from 'react'
import { Subscription } from 'react-apollo'
import jsonpatch from 'json-patch'

const LiveSubscription = ({ variables, subscription, children }) => {
  if (children.length !== 1) {
    throw new Error('LiveSubscription must have 1 child component')
  }
  const ChildComponent = children[0] || children
  const key = 'live'
  let state = null

  return (
    <Subscription
      subscription={subscription}
      variables={variables}
    >
      {
        ({ data, loading, error }) => {
          if (data != null) {
            const { query, patches } = data[key]
            if (query != null) state = query
            if (patches != null) {
              patches.forEach(patch => {
                state = jsonpatch.apply(state, patch)
              })
            }
          }
          return (
            <ChildComponent
              data={state}
              loading={loading}
              error={error}
            />
          )
        }
      }
    </Subscription>
  )
}

export default LiveSubscription
