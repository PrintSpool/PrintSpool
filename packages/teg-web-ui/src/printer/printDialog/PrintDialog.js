import React, { useContext, useCallback } from 'react'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@material-ui/core'

import { UserDataContext } from '../../UserDataProvider'

import PrintDialogContent from './PrintDialogContent'
import CreateJobMutation from './CreateJobMutation'

import PrintFilesContext from './PrintFilesContext'

const PrintDialog = ({
  history,
  match,
}) => {
  const [files] = useContext(PrintFilesContext)

  const { hostID } = match.params
  const open = true

  const onClose = useCallback(() => {
    history.push('../')
  })

  // if (host == null) {
  //   return (
  //     <Dialog
  //       maxWidth={false}
  //       onClose={onClose}
  //       aria-labelledby="print-dialog-title"
  //       open={open}
  //       transitionDuration={0}
  //     >
  //       <DialogContent>
  //         { open && (
  //           <Typography
  //             variant="h5"
  //           >
  //             404 Printer Not Found :(
  //           </Typography>
  //         )}
  //       </DialogContent>
  //     </Dialog>
  //   )
  // }

  return (
    <Dialog
      maxWidth={false}
      onClose={onClose}
      aria-labelledby="print-dialog-title"
      open={open}
      transitionDuration={{
        exit: 0,
      }}
    >
      <DialogTitle id="print-dialog-title" onClose={onClose}>
        Print Preview
      </DialogTitle>
      <DialogContent>
        { open && (
          <PrintDialogContent files={files} />
        )}
      </DialogContent>
      <DialogActions>
        <CreateJobMutation
          files={files}
          onCompleted={() => {
            history.push(`/q/${hostID}/`)
          }}
          onError={(e) => {
            // eslint-disable-next-line no-console
            console.error('PRINTING ERROR', e)
          }}
        >
          {({ createJob }) => (
            <Button
              onClick={createJob}
              color="primary"
              variant="contained"
            >
              Print
            </Button>
          )}
        </CreateJobMutation>
      </DialogActions>
    </Dialog>
  )
}

export default PrintDialog
