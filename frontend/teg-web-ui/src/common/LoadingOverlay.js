
import React from 'react'

import Loading from './Loading'
import useStyles from './LoadingOverlayStyles'

const LoadingOverlay = ({
  className = '',
  children = null,
  loading,
  loadingText = 'Loading...',
  ...props
}) => {
  const classes = useStyles()
  return (
    <Box className={`${classes.root} ${className}`}>
      { loading && (
        <Loading
          className={classes.loading}
          {...props}
        >
          {loadingText}
        </Loading>
      )}
      <Box className={classes.content}>
        {children}
      </Box>
    </Box>
  )
}

export default LoadingOverlay
