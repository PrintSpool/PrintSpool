import React, { useState } from 'react'
import gql from 'graphql-tag'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

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
const ComponentControl = ({
  machine,
  component,
  disabled,
  execGCodes,
}) => {
  const classes = ComponentControlStyles()
  const { toolhead } = component

  const isToolhead = toolhead != null

  const distanceOptions = [0.1, 1, 10, 50, 100]
  const [distance, onChange] = useState(distanceOptions[2])

  return (
    <Card className={classes.root}>
      <CardContent>
        <Grid
          container
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
                  machine={machine}
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
            {component.heater != null && (
              <React.Fragment>
                <div className={classes.extruderButtons}>
                  <OverrideTempButton
                    {...{
                      machine,
                      component,
                      execGCodes,
                    }}
                  />
                  {isToolhead && (
                    <>
                      <Button
                        className={classes.extruderButton}
                        disabled={disabled}
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
                        disabled={disabled}
                      />
                    </>
                  )}
                </div>
                <JogDistanceButtons
                  className={classes.extruderJogDistances}
                  distanceOptions={distanceOptions}
                  input={{
                    value: distance,
                    onChange,
                  }}
                />
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

export default ComponentControl
