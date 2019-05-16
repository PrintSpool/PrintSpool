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
import FanSection from './FanSection'

export const ComponentControlFragment = gql`
  fragment ComponentControlFragment on Component {
    id
    name
    type
    address
    heater {
      currentTemperature
      targetTemperature
    }
    fan {
      enabled
      speed
    }
  }
`
const ToolheadAndBedControl = ({
  printer,
  component,
  disabled,
}) => (
  <Card>
    <CardContent>
      <Grid
        container
        spacing={24}
      >
        <Grid item xs={component.fan ? 12 : 6}>
          <Typography variant="subtitle1">
            {component.name}
          </Typography>
          {
            component.heater && (
              <TemperatureSection
                printer={printer}
                component={component}
                disabled={disabled}
              />
            )
          }
        </Grid>
        <Grid item xs={6}>
          {
            component.type === 'TOOLHEAD' && (
              <ExtruderButtons
                printer={printer}
                address={component.address}
                form={`toolhead[${component.id}]`}
                disabled={disabled}
              />
            )
          }
          {
            component.type === 'FAN' && (
              <FanSection
                printer={printer}
                component={component}
                address={component.address}
                disabled={disabled}
              />
            )
          }
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)

export default ToolheadAndBedControl
