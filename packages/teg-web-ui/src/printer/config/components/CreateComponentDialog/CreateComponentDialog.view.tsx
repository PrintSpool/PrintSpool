import React from 'react'
import { gql } from '@apollo/client'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
// import DialogContent from '@material-ui/core/DialogContent'
// import DialogActions from '@material-ui/core/DialogActions'
// import Button from '@material-ui/core/Button'
// import Stepper from '@material-ui/core/Stepper'
// import Step from '@material-ui/core/Step'
// import StepLabel from '@material-ui/core/StepLabel'

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

const createComponentDialog = ({
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

export default createComponentDialog
