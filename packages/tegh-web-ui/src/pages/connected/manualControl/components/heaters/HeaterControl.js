import React from 'react'
import gql from 'graphql-tag'
import {
  Card,
  CardContent,
  Grid,
  Typography,
} from '@material-ui/core'

import TemperatureSection from './TemperatureSection'
import ExtruderButtons from './ExtruderButtons'

export const HeaterControlFragment = gql`
  fragment HeaterControlFragment on Heater {
    id
    name
    type
    currentTemperature
    targetTemperature
  }
`
const HeaterControl = ({
  heater,
  disabled,
}) => (
  <Card>
    <CardContent>
      <Grid
        container
        spacing={24}
      >
        <Grid item xs={6}>
          <Typography variant="subtitle1">
            {heater.name}
          </Typography>
          <TemperatureSection
            heater={heater}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={6}>
          {
            heater.type === 'EXTRUDER'
            && (
            <ExtruderButtons
              id={heater.id}
              form={`extruder[${heater.id}]`}
              disabled={disabled}
            />
            )
          }
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)

export default HeaterControl
