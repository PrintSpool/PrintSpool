import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { Subscription } from 'react-apollo'
import jsonpatch from 'json-patch'
import setLiveSubscriptionState from '../actions/setLiveSubscriptionState'

const enhance = compose(
  connect(
    (reduxState, { reduxKey }) => ({
      state: reduxState.liveSubscriptions.get(reduxKey),
    }),
    (dispatch, { reduxKey }) => ({
      setState: state => dispatch(setLiveSubscriptionState({
        key: reduxKey,
        state,
      })),
    }),
  ),
)

// eslint-disable-next-line import/prefer-default-export
export const LiveSubscription = enhance(({
  variables,
  subscription,
  onSubscriptionData,
  children,
  setState,
  state,
}) => {
  if (children.length !== 1) {
    throw new Error('LiveSubscription must have 1 child component')
  }
  const ChildComponent = children[0] || children
  const key = 'live'

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
})
