import React, { useCallback, useContext } from 'react'
import useReactRouter from 'use-react-router'

import {
  withStyles,
  Fab,
  Tooltip,
} from '@material-ui/core'
import {
  Add,
} from '@material-ui/icons'

import PrintFilesContext from '../printDialog/PrintFilesContext'
import FileInput from '../../common/FileInput'

const styles = theme => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing.unit * 4 + 56,
    right: theme.spacing.unit * 2,
  },
})

const enhance = withStyles(styles, { withTheme: true })

const FloatingAddJobButton = ({ classes, href }) => {
  const [, setFiles] = useContext(PrintFilesContext)

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
