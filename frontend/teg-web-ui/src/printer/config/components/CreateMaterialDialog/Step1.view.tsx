import React from 'react'

import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'

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
        <Stepper activeStep={wizard.activeStep} sx={{ mb: 2 }}>
          {
            STEPS.map((label, index) => (
              <Step key={label} completed={index < wizard.activeStep}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))
          }
        </Stepper>
        <Controller
          rules={{ required: 'A material type is required' }}
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
        <Button type="submit" variant="contained">
          Next
        </Button>
      </DialogActions>
    </form>
  )
}

export default CreateMaterialStep1
