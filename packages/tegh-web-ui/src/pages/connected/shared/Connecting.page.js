import React from 'react'
import  {
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
    margin: theme.spacing.unit * 2,
  },
})

const enhance = compose(
  withStyles(styles),
)

const ConnectingPage = ({ classes }) => (
  <div className={classes.page}>
    <Typography variant="h4" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
      <CircularProgress className={classes.progress} />
      Connecting to 3D Printer...
    </Typography>
  </div>
)

export default enhance(ConnectingPage)
