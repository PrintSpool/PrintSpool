import React, { useEffect, useRef, useState } from 'react'

import {
  Typography,
  Button,
} from '@material-ui/core'

import PrintDialogContentStyles from './PrintDialogContentStyles'

import renderGCode from './gcodeRenderer/renderGCode'

const MB = 1000 * 1000

const PrintDialogContent = ({
  files,
}) => {
  const classes = PrintDialogContentStyles()

  const largeFile = files[0].size > 5 * MB

  const [loading, setLoading] = useState(true)
  const [shouldLoad, setShouldLoad] = useState(!largeFile)
  const webGLContainer = useRef()

  useEffect(() => {
    if (shouldLoad === false) {
      return
    }
    return renderGCode(files, webGLContainer, setLoading)
  }, [shouldLoad])

  return (
    <div>
      {!shouldLoad && (
        <Typography
          variant="h5"
          className={classes.largeFileMessage}
        >
          GCode preview disabled for large file (
          {(files[0].size / (1 * MB)).toPrecision(2)}
          MB)
          <Button
            variant="contained"
            onClick={() => setShouldLoad(true)}
            className={classes.enableButton}
          >
            Enable Preview
          </Button>
        </Typography>
      )}
      {shouldLoad && loading && (
        <Typography
          variant="h5"
          className={classes.loading}
        >
          Loading Preview...
        </Typography>
      )}
      <div
        ref={webGLContainer}
        className={classes.webGLContainer}
      />
    </div>
  )
}

export default PrintDialogContent
