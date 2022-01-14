import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import useStyles from './EditPart.styles.js'
import PartHeader from '../PartHeader'

const EditPartView = ({
  machineName,
  part,
  setQuantity,
  setQuantityMutation,
  moveToTopOfQueue,
}) => {
  const classes = useStyles()

  const {
    register,
    handleSubmit,
    errors,
    setError,
  } = useForm({
    defaultValues: part,
  })

  useEffect(() => {
    if (!setQuantityMutation.loading && setQuantityMutation.error) {
      setError('quantity', setQuantityMutation.error)
    }
  }, [setQuantityMutation.loading, setQuantityMutation.error])

  return (
    <div className={classes.root}>
      <PartHeader {...{
        machineName,
        part,
        value: 2,
      }}/>

      <Card>
        <CardHeader
          title="Settings"
        />
        <CardContent>
          <Button
            className={classes.moveToTopOfQueue}
            variant="outlined"
            onClick={moveToTopOfQueue}
            disabled={part.startedFinalPrint}
          >
            Move to Top of Queue
          </Button>

          <form onSubmit={handleSubmit(setQuantity)}>
            <TextField
              name="quantity"
              type="number"
              inputRef={register({
                required: 'Required',
                min: {
                  value: 1,
                  message: 'Quantity must be at least 1',
                },
              })}
              error={errors.quantity != null}
              helperText={errors.quantity?.message}
            />
            <Button
              className={classes.quantityButton}
              type="submit"
              variant="outlined"
              disabled={setQuantityMutation.loading}
            >
              Set Quanity
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditPartView
