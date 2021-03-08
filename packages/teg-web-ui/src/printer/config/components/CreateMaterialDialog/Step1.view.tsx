import React from 'react'

import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'

import materialTypeNames from './materialTypeNames'

import { Controller, useForm } from 'react-hook-form'

const STEPS = [
  'Select a Type',
  'Configure the Material',
]

const CreateMaterialStep1 = ({
  active,
  wizard,
  onCancel,
  onSubmit,
}) => {
  const {
    // register,
    handleSubmit,
    errors,
    control,
  } = useForm({
    defaultValues: {
      materialType: '',
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
          rules={{ required: 'A component type is required' }}
          render={({ ref, value, onChange, onBlur }) => (
            <TextField
              inputRef={ref}
              onChange={e => onChange(e.target.value)}
              onBlur={onBlur}
              value={value}
              type="text"
              label="Please select a type for the material"
              select
              margin="normal"
              error={errors.materialType != null}
              helperText={errors.materialType?.message}
              fullWidth
            >
              {materialTypeNames
                .map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              }
            </TextField>
          )}
          name="materialType"
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

export default CreateMaterialStep1
