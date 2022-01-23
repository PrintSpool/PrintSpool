import React from 'react'
import QRCode from 'qrcode.react'
import { useSnackbar } from 'notistack'

import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Box from '@mui/material/Box'

const STEPS = [
  'Configure your Invite',
  'Share the Invite Code',
]

const CreateInviteStep2 = ({
  wizard,
  inviteURL,
  onClose,
}) => {
  const { enqueueSnackbar } = useSnackbar()

  return (
    <>
      <DialogContent style={{ minHeight: '12em' }}>
        <Stepper activeStep={wizard.activeStep}>
          {
            STEPS.map((label, index) => (
              <Step key={label} completed={index < wizard.activeStep}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))
          }
        </Stepper>
        <div>
          <Typography variant="h1" sx={{
            textAlign: 'center',
            mt: 2,
          }}>
            Share the QR code or the link bellow to invite a friend
          </Typography>
          <Box sx={{
            textAlign: 'center',
            mt: 4,
          }}>
            <QRCode
              value={inviteURL}
              size={300}
            />
          </Box>
          <TextField
            label="Invite URL"
            value={inviteURL}
            fullWidth
            onClick={(e) => {
              const input = e.target as any;
              input.focus()
              input.select()

              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(inviteURL)
                enqueueSnackbar('Invite Copied to Clipboard!', { variant: 'success' })
              }
            }}
            sx={{
              '& input': {
                fontSize: '0.8rem',
                lineHeight: '1rem',
              },
              mt: 4,
            }}
          />
          <Typography variant="body2" sx={{
            mt: 2,
          }}>
            Please copy the invite code before you leave this page. For security purposes
            the invite code will no longer be accessible after you leave this page.
          </Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Finish
        </Button>
      </DialogActions>
    </>
  )
}

export default CreateInviteStep2
