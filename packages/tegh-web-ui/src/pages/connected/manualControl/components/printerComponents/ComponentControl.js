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
import HistoryChart from './HistoryChart'

export const ComponentControlFragment = gql`
  fragment ComponentControlFragment on Component {
    id
    name
    type
    address
    configForm {
      id
      model
      modelVersion
    }
    toolhead {
      currentMaterial {
        id
        name
      }
    }
    heater {
      materialTarget
      currentTemperature
      targetTemperature
      history {
        id
        createdAt
        currentTemperature
        targetTemperature
      }
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
        <Grid item xs={12} md={component.fan ? 12 : 4}>
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
        <Grid
          item
          xs={12}
          md={8}
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {
            component.type === 'TOOLHEAD' && (
              <ExtruderButtons
                printer={printer}
                address={component.address}
                disabled={disabled}
              />
            )
          }
          {
            component.heater && (
              <HistoryChart
                data={component.heater.history}
                materialTarget={component.heater.materialTarget || 220}
                isToolhead={component.type === 'TOOLHEAD'}
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
