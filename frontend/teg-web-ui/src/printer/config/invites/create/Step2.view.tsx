import React from 'react'
import QRCode from 'qrcode.react'

import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'

const STEPS = [
  'Configure your Invite',
  'Share the Invite Code',
]

const CreateInviteStep2 = ({
  wizard,
  classes,
  inviteURL,
  onClose,
}) => {
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
          <Typography variant="body1" paragraph className={classes.shareTitle}>
            Scan this QR code or use the link bellow it to share access to your 3D printer.
          </Typography>
          <div className={classes.qrCode}>
            <QRCode
              value={inviteURL}
              size={300}
            />
          </div>
          <TextField
            label="Invite URL"
            InputProps={{ classes: { input: classes.inviteURLField } }}
            value={inviteURL}
            fullWidth
            multiline
            onClick={event => (event.target as any).select()}
          />
          <Typography variant="body2" paragraph className={classes.shareWarning}>
            Please share the invite code before you leave this page. For security purposes
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
