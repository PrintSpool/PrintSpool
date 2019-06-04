import React from 'react'
import {
  Button,
} from '@material-ui/core'

import PrintButtonStyles from './PrintButtonStyles'
import FileInput from '../../common/FileInput'

const PrintButton = ({ onClick }) => {
  const classes = PrintButtonStyles()

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
