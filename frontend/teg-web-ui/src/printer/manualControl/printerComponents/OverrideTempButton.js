import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useAsync } from 'react-async'
import LoadingOverlay from '../../../common/LoadingOverlay'

const OverrideTempButton = ({
  component,
  execGCodes,
  disabled,
}) => {
  const {
    handleSubmit,
    register,
    errors,
    setError,
    reset,
  } = useForm()

  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => {
    if (!open) {
      reset({
        targetTemperature: component.heater.targetTemperature,
      })
    }
    setOpen(!open)
  }, [open])

  const onSubmit = useAsync({
    deferFn: async ([data]) => {
      try {
        const target = parseFloat(data.targetTemperature)
        await execGCodes({
          gcodes: [
            { setTargetTemperatures: { heaters: { [component.address]: target } } },
          ],
          override: true,
          sync: true,
        })
        toggle()
      } catch (e) {
        setError('targetTemperature', {
          type: 'serverError',
          message: e.message,
        })
      }
    },
  })

  return (
    <>
      <Button
        disabled={disabled}
        onClick={toggle}
      >
        Override Temperature
      </Button>
      <Dialog
        open={open}
        onClose={toggle}
        aria-labelledby="override-temp-dialog-title"
      >
        <LoadingOverlay loading={onSubmit.isPending} loadingText="">
          <form
            // className={classes.form}
            onSubmit={handleSubmit(onSubmit.run)}
          >
            <DialogTitle id="override-temp-dialog-title">
              Temporary Override
            </DialogTitle>

            <DialogContent>
              <DialogContentText>
                Temporarily override the target temperature of
                {' '}
                {component.name}
                .
              </DialogContentText>
              <TextField
                name="targetTemperature"
                label="Target Temperature"
                type="number"
                inputRef={register({
                  required: 'Required',
                })}
                margin="normal"
                error={errors.targetTemperature != null}
                helperText={errors.targetTemperature?.message}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={toggle}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Submit
              </Button>
            </DialogActions>
          </form>
        </LoadingOverlay>
      </Dialog>
    </>
  )
}

export default OverrideTempButton
