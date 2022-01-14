import React from 'react'
import classNames from 'classnames'

import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import CircularProgress from '@mui/material/CircularProgress'

import LoadingStyles from './LoadingStyles'

const Loading = ({
  transitionDelay = 800,
  transitionDuration = 600,
  className = null,
  noText = false,
  noSpinner = false,
  children = 'Loading...',
  fullScreen = false,
  ...props
}) => {
  const classes = LoadingStyles()

  return (
    <Fade
      style={{
        transitionDelay: `${transitionDelay}ms`
      }}
      timeout={ transitionDuration }
      in={props.in == null ? true : props.in}
    >
      <div className={classNames(
        classes.root,
        fullScreen && classes.fullScreen,
        className,
      )}>
        <div className={classes.row}>
          { !noSpinner && (
            <CircularProgress />
          )}
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
