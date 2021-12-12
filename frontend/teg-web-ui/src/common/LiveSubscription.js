import useLiveSubscription from '../printer/_hooks/useLiveSubscription'

// eslint-disable-next-line import/prefer-default-export
export const LiveSubscription = ({
  queryFragment,
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
  } = useLiveSubscription(queryFragment, options)

  return children({
    data,
    loading,
    error,
  })
}
