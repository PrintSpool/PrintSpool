import React from 'react'
import {
  Typography,
  CircularProgress,
  withStyles,
} from '@material-ui/core'
import {
  compose,
} from 'recompose'

const styles = theme => ({
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
})

const enhance = compose(
  withStyles(styles),
)

const FullscreenProgress = ({
  variant = 'h5',
  color = '#eee',
  classes,
  children,
}) => (
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

export default enhance(FullscreenProgress)
