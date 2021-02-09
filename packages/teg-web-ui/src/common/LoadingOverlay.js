
import React from 'react'

import Loading from './Loading'
import useStyles from './LoadingOverlayStyles'

const LoadingOverlay = ({
  className = '',
  children = [],
  loading,
  loadingText = 'Loading...',
  ...props
}) => {
  const classes = useStyles()
  return (
    <div className={`${classes.root} ${className}`}>
      { loading && (
        <Loading
          className={classes.loading}
          {...props}
        >
          {loadingText}
        </Loading>
      )}
      <div className={classes.content}>
        {children}
      </div>
    </div>
  )
}

export default LoadingOverlay
