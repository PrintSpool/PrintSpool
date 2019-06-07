import React from 'react'
import classNames from 'classnames'

import {
  Typography,
  Fade,
  CircularProgress,
} from '@material-ui/core'

import LoadingStyles from './LoadingStyles'

const Loading = ({
  transitionDelay = 800,
  transitionDuration = 600,
  className,
  noText = false,
  children = 'Loading...',
}) => {
  const classes = LoadingStyles()

  return (
    <Fade
      style={{
        transitionDelay: `${transitionDelay}ms`
      }}
      timeout={ transitionDuration }
      in
      unmountOnExit
    >
      <div className={classNames(classes.root, className)}>
        <div>
          <CircularProgress />
          { !noText && (
            <Typography variant="h5" className={classes.text}>
              {children}
            </Typography>
          )}
        </div>
      </div>
    </Fade>
  )
}

export default Loading
