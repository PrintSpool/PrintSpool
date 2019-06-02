import React, { useState, useCallback } from 'react'
import gql from 'graphql-tag'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
} from '@material-ui/core'

import TemperatureSection from './TemperatureSection'
import ExtruderButtons from './ExtruderButtons'
import FanSection from './FanSection'
import HistoryChart from './HistoryChart'
import FilamentSwapDialog from './FilamentSwapDialog'

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

  const [filamentSwapDialogOpen, setFilamentSwapDialogOpen] = useState(false)

  const openFilamentSwapDialog = useCallback(() => setFilamentSwapDialogOpen(true))
  const closeFilamentSwapDialog = useCallback(() => setFilamentSwapDialogOpen(false))

  const isToolhead = toolhead != null

  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={24}
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
                        onClick={openFilamentSwapDialog}
                      >
                        Swap Filament
                        <FilamentSwapDialog
                          onClose={closeFilamentSwapDialog}
                          open={filamentSwapDialogOpen}
                          printer={printer}
                          component={component}
                        />
                      </Button>
                    )
                  }
                />
              )
            }
            {
              component.heater && (
                <HistoryChart
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
