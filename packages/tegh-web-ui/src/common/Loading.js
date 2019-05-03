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
  children = 'Loading...',
}) => {
  const classes = LoadingStyles()

  return (
    <Fade
      style={{ transitionDelay: `${transitionDelay}ms` }}
      timeout={ transitionDuration }
      in
      unmountOnExit
    >
      <div className={classNames(classes.root, className)}>
        <CircularProgress />
        <Typography variant="h5" inline className={classes.text}>
          {children}
        </Typography>
      </div>
    </Fade>
  )
}

export default Loading
