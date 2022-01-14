import React from 'react'

import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'

import ConfigForm from '../../components/ConfigForm/ConfigForm'
import ConfigFields from '../../components/ConfigForm/ConfigFields'

const STEPS = [
  'Configure your Invite',
  'Share the Invite Code',
]

const CreateInviteStep1 = ({
  configForm,
  mutation,
  wizard,
  onSubmit,
  onCancel,
}) => {
  return (
    <ConfigForm {...{
      configForm,
      developerMode: false,
      mutation,
      onSubmit,
    }} >
      <DialogContent style={{ minHeight: '12em' }}>
        <Stepper activeStep={wizard.activeStep} sx={{ mb: 2 }}>
          {
            STEPS.map((label, index) => (
              <Step key={label} completed={index < wizard.activeStep}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))
          }
        </Stepper>
        <ConfigFields />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          Finish
        </Button>
      </DialogActions>
    </ConfigForm>
  )
}

export default CreateInviteStep1
