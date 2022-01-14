import React from 'react'

import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  page: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    height: '90vh',
  },
  progress: {
    marginRight: theme.spacing(2),
  },
}))

const FullscreenProgress = ({
  variant = 'h5',
  color = '#eee',
  children,
}) => {
  const classes = useStyles()

  return (
    <div className={classes.page}>
      <Typography variant={variant} style={{ color }}>
        <CircularProgress
          className={classes.progress}
          size={variant === 'h4' ? 40 : 30}
        />
        {children}
      </Typography>
    </div>
  )
}

export default FullscreenProgress
