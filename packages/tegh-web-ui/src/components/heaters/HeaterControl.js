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
} from '@material-ui/core'
import { Field, reduxForm, formValues } from 'redux-form'

import JogDistanceButtons from '../jog/JogDistanceButtons'
import TemperatureSection from './TemperatureSection'
import ExtruderButtons from './ExtruderButtons'

const HeaterControl = ({
  id,
  name,
  isExtruder,
  disabled,
}) => (
  <Card>
    <CardContent>
      <Grid
        container
        spacing={24}
      >
        <Grid item xs={6}>
          <Typography variant='subheading'>
            {name}
          </Typography>
          <TemperatureSection
            id={id}
            name={name}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={6}>
          {
            isExtruder &&
            <ExtruderButtons
              id={id}
              form={`extruder[${id}]`}
              disabled={disabled}
            />
          }
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)

export default HeaterControl
