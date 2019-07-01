import React, { useCallback, useContext } from 'react'
import useReactRouter from 'use-react-router'

import {
  Fab,
  Tooltip,
} from '@material-ui/core'
import {
  withStyles,
} from '@material-ui/styles'

import Add from '@material-ui/icons/Add'

import PrintFilesContext from '../printDialog/PrintFilesContext'
import FileInput from '../../common/FileInput'

const styles = theme => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(4) + 56,
    right: theme.spacing(2),
  },
})

const enhance = withStyles(styles, { withTheme: true })

const FloatingAddJobButton = ({ classes, href }) => {
  const setFiles = useContext(PrintFilesContext)[1]

  const { history } = useReactRouter()

  const onClick = useCallback((files) => {
    setFiles(files)
    history.push(href)
  })

  return (
    <Tooltip title="Add Job" placement="left">
      <Fab
        component="label"
        className={classes.fab}
        color="default"
      >
        <FileInput
          accept=".ngc,.gcode"
          onClick={onClick}
        />
        <Add />
      </Fab>
    </Tooltip>
  )
}

export default enhance(FloatingAddJobButton)
