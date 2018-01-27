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

import JogDistanceButtons from '../jog/JogDistanceButtons'
import TemperatureSection from './TemperatureSection'
import ExtruderButtons from './ExtruderButtons'

const HeaterControl = ({
  id,
  name,
  isExtruder,
}) => (
  <Card>
    <CardContent>
      <Grid
        container
        spacing={24}
      >
        <Grid item xs={6}>
          <Typography type='subheading'>
            {name}
          </Typography>
          <TemperatureSection id={id} name={name}/>
        </Grid>
        <Grid item xs={6}>
          {
            isExtruder &&
            <ExtruderButtons id={id} form={`extruder[${id}]`} />
          }
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)

export default HeaterControl
