import React, { useCallback, useContext } from 'react'
import {
  Button,
} from '@material-ui/core'
import useReactRouter from 'use-react-router'

import PrintFilesContext from '../printDialog/PrintFilesContext'

import PrintButtonStyles from './PrintButtonStyles'
import FileInput from '../../common/FileInput'

const PrintButton = ({
  href,
}) => {
  const classes = PrintButtonStyles()
  const [, setFiles] = useContext(PrintFilesContext)

  const { history } = useReactRouter()

  const onClick = useCallback((files) => {
    setFiles(files)
    history.push(href)
  })

  return (
    <Button
      component="label"
      variant="contained"
      color="primary"
      className={classes.button}
    >
      3D Print
      <FileInput
        accept=".ngc,.gcode"
        onClick={onClick}
      />
    </Button>
  )
}

export default PrintButton
