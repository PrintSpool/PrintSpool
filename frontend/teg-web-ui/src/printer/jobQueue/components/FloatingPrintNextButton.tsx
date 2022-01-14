import React from 'react'

import Tooltip from '@mui/material/Tooltip'
import Fab from '@mui/material/Fab'

import makeStyles from '@mui/styles/makeStyles';

import PlayArrow from '@mui/icons-material/PlayArrow'

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  }
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
        variant="extended"
        disabled={disabled}
        onClick={onClick}
      >
        <PlayArrow className={classes.extendedIcon} />
        Print Next
      </Fab>
    </Wrapper>
  )
}

export default FloatingPrintNextButton
