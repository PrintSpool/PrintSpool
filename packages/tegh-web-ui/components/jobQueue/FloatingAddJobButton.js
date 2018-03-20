import React from 'react'
import {
  withStyles,
  Button,
  Tooltip,
} from 'material-ui'
import {
  Add,
} from 'material-ui-icons'

const styles = theme => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing.unit * 4 + 56,
    right: theme.spacing.unit * 2,
  },
})

const enhance = withStyles(styles, { withTheme: true })

const FloatingAddJobButton = ({ classes }) => {
  return (
    <Tooltip title="Add Job" placement="left">
      <Button variant="fab" className={ classes.fab } color="default">
        <Add />
      </Button>
    </Tooltip>
  )
}

export default enhance(FloatingAddJobButton)
