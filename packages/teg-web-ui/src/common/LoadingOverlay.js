
import React from 'react'

import Loading from './Loading'
import useStyles from './LoadingOverlayStyles'

const LoadingOverlay = ({ children, loading }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      { loading && (
        <Loading className={classes.loading} />
      )}
      <div className={classes.content}>
        {children}
      </div>
    </div>
  )
}

export default LoadingOverlay
