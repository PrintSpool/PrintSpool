import React, { useMemo } from 'react'
import useLiveSubscription from '../printer/_hooks/useLiveSubscription'
import Loading from './Loading'

// eslint-disable-next-line import/prefer-default-export
export const LiveSubscription = ({
  subscription,
  children,
  ...options
}) => {
  if (typeof children !== 'function') {
    throw new Error('LiveSubscription must have 1 child component')
  }

  const {
    error,
    loading,
    data,
  } = useLiveSubscription(subscription, options)

  if (loading) {
    return <Loading fullScreen />
  }

  return children({
    data,
    loading,
    error,
  })
}
