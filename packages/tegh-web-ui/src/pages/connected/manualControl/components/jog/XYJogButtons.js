import React from 'react'
import { compose } from 'recompose'
import { Field, reduxForm, formValues } from 'redux-form'
import {
  Card,
  CardContent,
  Grid,
} from '@material-ui/core'
import {
  ArrowForward,
  ArrowBack,
  ArrowUpward,
  ArrowDownward,
} from '@material-ui/icons'

import withJog from '../../higherOrderComponents/withJog'
import JogButton from './JogButton'
import JogDistanceButtons from './JogDistanceButtons'

const enhance = compose(
  withJog,
  reduxForm({
    initialValues: {
      distance: 10,
    },
  }),
  formValues('distance'),
)

const XYJogButtons = ({ printer, jog, distance }) => (
  <Card>
    <CardContent>
      <Grid
        container
        spacing={24}
      >
        <JogButton xs={12} onClick={jog(printer.id, 'y', '-', distance)}>
          <ArrowUpward />
        </JogButton>
        <JogButton xs={4} onClick={jog(printer.id, 'x', '-', distance)} textAlign="right">
          <ArrowBack />
        </JogButton>
        <JogButton xs={4} disabled>
          XY
        </JogButton>
        <JogButton xs={4} onClick={jog(printer.id, 'x', '+', distance)} textAlign="left">
          <ArrowForward />
        </JogButton>
        <JogButton xs={12} onClick={jog(printer.id, 'y', '+', distance)}>
          <ArrowDownward />
        </JogButton>
        <Field
          name="distance"
          component={JogDistanceButtons}
          distanceOptions={[1, 10, 50, 100]}
        />
      </Grid>
    </CardContent>
  </Card>
)

export default enhance(XYJogButtons)
