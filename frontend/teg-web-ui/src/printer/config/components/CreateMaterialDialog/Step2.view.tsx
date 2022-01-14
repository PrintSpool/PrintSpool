import React from 'react'

import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'

import ConfigForm from '../ConfigForm/ConfigForm'
import ConfigFields from '../ConfigForm/ConfigFields'

const STEPS = [
  'Select a Type',
  'Configure the Component',
]

const CreateMaterialStep2 = ({
  configForm,
  developerMode,
  mutation,
  wizard,
  onSubmit,
  onBack,
}) => {
  return (
    <ConfigForm {...{
      configForm,
      developerMode,
      mutation,
      onSubmit,
    }} >
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
        <ConfigFields />
      </DialogContent>
      <DialogActions>
        <Button onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="contained">
          Finish
        </Button>
      </DialogActions>
    </ConfigForm>
  )
}

export default CreateMaterialStep2
