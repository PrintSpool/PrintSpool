import React from 'react'
import {
  withStyles,
  Button,
  Tooltip,
} from 'material-ui'
import {
  PlayArrow,
} from 'material-ui-icons'

const styles = theme => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
})

const enhance = withStyles(styles, { withTheme: true })

const FloatingPrintNextButton = ({ classes }) => {
  return (
    <Tooltip title="Start the next print" placement="left">
      <Button variant="fab" className={ classes.fab } color="primary">
        <PlayArrow />
      </Button>
    </Tooltip>
  )
}

export default enhance(FloatingPrintNextButton)
