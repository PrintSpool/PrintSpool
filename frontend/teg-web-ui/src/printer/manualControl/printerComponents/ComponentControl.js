import React, { useState } from 'react'
import { gql } from '@apollo/client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import { Link } from 'react-router-dom'

import ExtrudeRetractButtons from '../ExtrudeRetractButtons'
import JogDistanceButtons from '../jog/JogDistanceButtons'

import TemperatureSection from './TemperatureSection'
import FanSection from './FanSection'
import TemperatureChart from '../TemperatureChart'

import ComponentControlStyles from './ComponentControlStyles'
import OverrideTempButton from './OverrideTempButton'

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
      actualTemperature
      targetTemperature
      history {
        id
        createdAt
        actualTemperature
        targetTemperature
      }
    }
    speedController {
      enabled
      targetSpeed
    }
  }
`

const CONTINUOUS = 'Continuous'

const ComponentControl = ({
  machine,
  component,
  isReady,
  isPrinting,
  execGCodes,
  printOverridesOnly = false,
}) => {
  const classes = ComponentControlStyles()
  const { toolhead } = component

  const isToolhead = toolhead != null

  const distanceOptions = [1, 10, 50, 100, CONTINUOUS]
  const [distance, onChange] = useState(CONTINUOUS)

  return (
    <Card className={classes.root}>
      <CardContent>
        <Grid
          container
        >
          <Grid item xs={12} md={component.fan ? 12 : 4}>
            <Typography variant="body1">
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
                  machine={machine}
                  component={component}
                  disabled={!isReady}
                  printOverridesOnly={printOverridesOnly}
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
            {component.heater != null && (
              <React.Fragment>
                <div className={classes.extruderButtons}>
                  <OverrideTempButton
                    {...{
                      machine,
                      component,
                      execGCodes,
                      disabled: !isReady && !isPrinting,
                    }}
                  />
                  {isToolhead && !printOverridesOnly && (
                    <>
                      <Button
                        className={classes.extruderButton}
                        disabled={!isReady}
                        component={React.forwardRef((props, ref) => (
                          <Link
                            to={`swap-filament/${component.id}`}
                            innerRef={ref}
                            {...props}
                          />
                        ))}
                      >
                        Swap Filament
                      </Button>
                      <ExtrudeRetractButtons
                        className={classes.extruderButton}
                        machine={machine}
                        component={component}
                        distance={distance}
                        isReady={isReady}
                      />
                    </>
                  )}
                </div>
                { isToolhead && !printOverridesOnly && (
                  <JogDistanceButtons
                    className={classes.extruderJogDistances}
                    distanceOptions={distanceOptions}
                    input={{
                      value: distance,
                      onChange,
                    }}
                  />
                )}
              </React.Fragment>
            )}
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
                  machine={machine}
                  component={component}
                  address={component.address}
                  disabled={!isReady && !isPrinting}
                  execGCodes={execGCodes}
                />
              )
            }
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ComponentControl
