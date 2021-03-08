import React from 'react'

import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'

import componentTypeNames from './componentTypeNames'

import { Controller, useForm } from 'react-hook-form'

const STEPS = [
  'Select a Type',
  'Configure the Component',
]

const CreateComponentStep1 = ({
  active,
  wizard,
  fixedListComponentTypes,
  onCancel,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    errors,
    control,
  } = useForm({
    defaultValues: {
      componentType: '',
    },
  })

  if (!active) {
    return <div/>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
        <Controller
          as={
            <TextField
              type="text"
              label="Please select the type of the component"
              select
              margin="normal"
              error={errors.componentType != null}
              helperText={errors.componentType}
              fullWidth
            >
              {componentTypeNames
                .filter(option => (
                  fixedListComponentTypes.includes(option.value) === false
                ))
                .map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              }
            </TextField>
          }
          name="componentType"
          control={control}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" color="primary">
          Next
        </Button>
      </DialogActions>
    </form>
  )
}

export default CreateComponentStep1
