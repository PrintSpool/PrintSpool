import { compose } from 'recompose'
import styled from 'styled-components'
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  CardHeader,
  Switch,
  FormControlLabel,
  Button,
} from 'material-ui'
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
}) => (
  <Grid
    container
    spacing={24}
  >
    <Grid item lg={6} md={12}>
      <Field
        name='distance'
        component={ JogDistanceButtons([0.1, 1, 10, 50, 100]) }
      />
    </Grid>
    <Grid item lg={6} md={12}>
      <div style={{ textAlign: 'right'}}>
        <Button
          raised
          onClick={jog(id, '-', distance)}
        >
          Retract
        </Button>
        <div style={{ display: 'inline-block', width: '16px'}} />
        <Button
          raised
          color='primary'
          onClick={jog(id, '+', distance)}
        >
          Extrude
        </Button>
      </div>
    </Grid>
  </Grid>
)

export default enhance(ExtruderButtons)
