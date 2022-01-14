import React from 'react'
import { gql } from '@apollo/client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
// import DialogContent from '@mui/material/DialogContent'
// import DialogActions from '@mui/material/DialogActions'
// import Button from '@mui/material/Button'
// import Stepper from '@mui/material/Stepper'
// import Step from '@mui/material/Step'
// import StepLabel from '@mui/material/StepLabel'

// import transformComponentSchema from '../../printerComponents/transformComponentSchema'

import LoadingOverlay from '../../../../common/LoadingOverlay'
import componentTypeNames from './componentTypeNames'
// import Page1 from './Page1'

// import ConfigForm from '../ConfigForm/ConfigForm'
// import getDefaultValues from '../ConfigForm/getDefaultValues'
// import useConfigForm from '../ConfigForm/useConfigForm'
// import { useForm } from 'react-hook-form'
import CreateComponentStep1 from './Step1.view'
import CreateComponentStep2 from './Step2.view'

const STEPS = [
  'Select a Type',
  'Configure the Component',
]

const CreateComponentDialogView = ({
  open,
  history,
  loading,
  wizard,
  updateWizard,
  fixedListComponentTypes,
  // videoSources,
  // devices,
  // materials,
  mutation,
  configForm,
  developerMode,
  onCancel,
  onSubmit,
}) => {
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
          Add a
          {' '}
          {
            wizard.activeStep !== 0 && (
              componentTypeNames
                .find(c => c.value === wizard.componentType)
                .label
            )
          }
          { wizard.activeStep === 0 && 'Component' }
        </DialogTitle>
        <CreateComponentStep1 {...{
          active: wizard.activeStep === 0,
          history,
          wizard,
          fixedListComponentTypes,
          onSubmit: ({ componentType }) => updateWizard({
            componentType,
            activeStep: 1,
          }),
          onCancel,
        }} />
        { wizard.activeStep === 1 && (
          <CreateComponentStep2 {...{
            configForm,
            developerMode,
            mutation,
            wizard,
            onSubmit,
            onBack: () => updateWizard({
              ...wizard,
              activeStep: 0,
            }),
          }} />
        )}
      </LoadingOverlay>
    </Dialog>
  )
}

export default CreateComponentDialogView
