import React from 'react'
import { compose } from 'recompose'
import {
  Grid,
  Button,
} from '@material-ui/core'
import { Field, reduxForm, formValues } from 'redux-form'

import withJog from '../../higherOrderComponents/withJog'
import JogDistanceButtons from '../jog/JogDistanceButtons'

const enhance = compose(
  withJog,
  reduxForm({
    initialValues: {
      distance: 10,
    },
  }),
  formValues('distance'),
)

const ExtruderButtons = ({
  id,
  distance,
  jog,
  disabled,
}) => (
  <Grid
    container
    spacing={24}
  >
    <Grid item lg={6} md={12}>
      <Field
        name="distance"
        component={JogDistanceButtons([0.1, 1, 10, 50, 100])}
      />
    </Grid>
    <Grid item lg={6} md={12}>
      <div style={{ textAlign: 'right' }}>
        <Button
          variant="contained"
          disabled={disabled}
          onClick={jog(id, '-', distance)}
        >
          Retract
        </Button>
        <div style={{ display: 'inline-block', width: '16px' }} />
        <Button
          variant="contained"
          color="primary"
          disabled={disabled}
          onClick={jog(id, '+', distance)}
        >
          Extrude
        </Button>
      </div>
    </Grid>
  </Grid>
)

export default enhance(ExtruderButtons)
