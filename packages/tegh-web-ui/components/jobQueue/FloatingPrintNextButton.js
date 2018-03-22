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

const FloatingPrintNextButton = ({ classes, disabled }) => {
  return (
    <Tooltip title="Start the next print" placement="left">
      <div>
        <Button
          variant="fab"
          className={ classes.fab }
          color="primary"
          disabled={ disabled }
        >
          <PlayArrow />
        </Button>
      </div>
    </Tooltip>
  )
}

export default enhance(FloatingPrintNextButton)
