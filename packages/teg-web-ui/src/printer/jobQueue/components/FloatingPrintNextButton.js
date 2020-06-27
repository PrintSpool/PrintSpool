import React from 'react'

import Tooltip from '@material-ui/core/Tooltip'
import Fab from '@material-ui/core/Fab'

import { makeStyles } from '@material-ui/core/styles'

import PlayArrow from '@material-ui/icons/PlayArrow'

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}))

const Wrapper = ({ children, disabled }) => {
  if (disabled) return children
  return (
    <Tooltip title="Start the next print" placement="left">
      {children}
    </Tooltip>
  )
}

const FloatingPrintNextButton = ({ disabled, onClick }) => {
  const classes = useStyles()

  return (
    <Wrapper disabled={disabled}>
      <Fab
        className={classes.fab}
        color="primary"
        disabled={disabled}
        onClick={onClick}
      >
        <PlayArrow />
      </Fab>
    </Wrapper>
  )
}

export default FloatingPrintNextButton
