import React, { useLayoutEffect, useRef, useState } from 'react'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import LoadingOverlay from '../../common/LoadingOverlay'
import PrintDialogContentStyles from './PrintDialogContentStyles'

import renderGCode from './gcodeRenderer/renderGCode'

const MB = 1000 * 1000

const PrintDialogContent = ({
  submitting,
  files,
  loading,
  setLoading,
}) => {
  const classes = PrintDialogContentStyles()

  const largeFile = files[0].size > 80 * MB

  const [shouldLoad, setShouldLoad] = useState(!largeFile)
  const webGLContainer = useRef()

  useLayoutEffect(() => {
    if (shouldLoad === false) {
      setLoading(false)
      return
    }
    if (loading === false) {
      setLoading(true)
    }
    console.log('LOADING RENDER?')
    return renderGCode(files, webGLContainer, setLoading)
  }, [shouldLoad])

  return (
    <div>
      {!shouldLoad && !submitting && (
        <Typography
          variant="h5"
          className={classes.largeFileMessage}
        >
          GCode preview disabled for large file (
          {(files[0].size / (1 * MB)).toFixed(1)}
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
      <LoadingOverlay
        className={classes.webGLLoadingOverlay}
        loading={submitting || (shouldLoad && loading)}
        loadingText={submitting ? ('Uploading') : 'Loading Preview...'}
        transitionDelay={300}
        noSpinner={!submitting}
      >
        <canvas
          className={classes.webGLContainer}
          ref={webGLContainer}
        />
      </LoadingOverlay>
    </div>
  )
}

export default PrintDialogContent
