import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useAsync } from 'react-async'
import LoadingOverlay from '../../../common/LoadingOverlay'

const OverrideTempButton = ({
  component,
  execGCodes,
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
        disabled={component.heater.targetTemperature == null}
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
              <Button type="submit" color="primary">
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
