import React, { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TextField from '@material-ui/core/TextField'
import MuiLink from '@material-ui/core/Link'

import useStyles from './EditPart.styles.js.js'
import PartHeader from '../PartHeader'

const EditPartView = ({
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
