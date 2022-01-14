import React from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'

import useStyles from './CreateInviteDialog.styles'
import CreateInviteStep1 from './Step1.view'
import CreateInviteStep2 from './Step2.view'
import LoadingOverlay from '../../../../common/LoadingOverlay'

const STEPS = [
  'Configure your Invite',
  'Share the Invite Code',
]

const createInviteDialogView = ({
  open,
  loading,
  inviteURL,
  wizard,
  mutation,
  configForm,
  onCancel,
  onSubmit,
}) => {
  const classes = useStyles()

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="create-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <LoadingOverlay loading={loading}>
        <DialogTitle id="create-dialog-title">
          Invite your friends!
        </DialogTitle>
        { wizard.activeStep === 0 && (
          <CreateInviteStep1 {...{
            configForm,
            mutation,
            wizard,
            onSubmit,
            onCancel,
          }} />
        )}
        { wizard.activeStep === 1 && (
          <CreateInviteStep2 {...{
            wizard,
            classes,
            inviteURL,
            onClose: onCancel,
          }} />
        )}
      </LoadingOverlay>
    </Dialog>
  )
}

export default createInviteDialogView
