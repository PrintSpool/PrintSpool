import React, { useCallback } from 'react'
import gql from 'graphql-tag'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
} from '@material-ui/core'
import { Link } from 'react-router-dom'

import TemperatureSection from './TemperatureSection'
import ExtruderButtons from '../ExtrudeRetractButtons'
import FanSection from './FanSection'
import TemperatureChart from '../TemperatureChart'

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
}) => {
  const { toolhead } = component

  const isToolhead = toolhead != null

  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <Grid item xs={12} md={component.fan ? 12 : 4}>
            <Typography variant="subtitle1">
              {component.name}
              {' '}
              {toolhead && (
                `(${
                  (toolhead.currentMaterial || { name: 'no material' }).name
                })`
              )}
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
                  customButton={
                    toolhead && (
                      <Button
                        component={React.forwardRef((props, ref) => (
                          <Link
                            to={`swap-filament/${component.id}`}
                            innerRef={ref}
                            style={{ textDecoration: 'none' }}
                            {...props}
                          />
                        ))}
                      >
                        Swap Filament
                      </Button>
                    )
                  }
                />
              )
            }
            {
              component.heater && (
                <TemperatureChart
                  data={component.heater.history}
                  materialTarget={component.heater.materialTarget || 220}
                  horizontalGridLines
                  xyPlotProps={{
                    height: isToolhead ? 80 : 120,
                  }}
                  style={{
                    marginTop: isToolhead ? 8 : 0,
                    marginBottom: isToolhead ? -8 : 0,
                    width: '100%',
                  }}
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
}

export default ToolheadAndBedControl
