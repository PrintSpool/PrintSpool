import React from 'react'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@material-ui/core'

import TeghApolloProvider from '../../pages/connected/frame/higherOrderComponents/TeghApolloProvider'

import PrintDialogContent from './PrintDialogContent'
import CreateJobMutation from '../CreateJobMutation'

const PrintDialog = ({
  state,
  onCancel,
  open,
  history,
}) => {
  const { host, files } = state || {}
  if (state && host == null) {
    return (
      <Dialog
        maxWidth={false}
        onClose={onCancel}
        aria-labelledby="print-dialog-title"
        open={open}
        transitionDuration={0}
      >
        <DialogContent>
          { open && (
            <Typography
              variant="h5"
            >
              404 Printer Not Found :(
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog
      maxWidth={false}
      onClose={onCancel}
      aria-labelledby="print-dialog-title"
      open={open}
      transitionDuration={{
        exit: 0,
      }}
    >
      <DialogTitle id="print-dialog-title" onClose={onCancel}>
        Print Preview
      </DialogTitle>
      <DialogContent>
        { open && (
          <PrintDialogContent files={files} />
        )}
      </DialogContent>
      <DialogActions>
        <TeghApolloProvider hostIdentity={host && host.invite}>
          <CreateJobMutation
            files={files}
            onCompleted={() => {
              history.push(`/${host.id}/`)
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
        </TeghApolloProvider>
      </DialogActions>
    </Dialog>
  )
}

export default PrintDialog
