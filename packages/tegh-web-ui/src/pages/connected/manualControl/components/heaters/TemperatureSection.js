import React from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose, withProps } from 'recompose'
import {
  Typography,
  Switch,
  FormControlLabel,
} from '@material-ui/core'

import withSpoolMacro from '../../../shared/higherOrderComponents/withSpoolMacro'

export const TemperatureFragment = `
  fragment TemperatureFragment on Heater {
    id
    currentTemperature
    targetTemperature
  }
`

const enhance = compose(
  withSpoolMacro,
  withProps(({ heater }) => ({
    isHeating: (heater.targetTemperature || 0) > 0,
  })),
)

const targetText = (targetTemperature) => {
  if (targetTemperature == null) return 'OFF'
  return `${targetTemperature}°C`
}

const TemperatureSection = ({
  id,
  currentTemperature,
  targetTemperature,
  isHeating,
  loading,
  error,
  spoolMacro,
  disabled,
}) => {
  if (loading) return <div>Loading</div>
  if (error) return <div>Error</div>
  const toggleEnabled = (event, val) => {
    spoolMacro({
      macro: 'toggleHeater',
      args: { [id]: val },
    })
  }
  return (
    <div>
      <Typography variant="display1">
        {currentTemperature.toFixed(1)}
        °C /
        <sup style={{ fontSize: '50%' }}>
          {' '}
          {targetText(targetTemperature)}
        </sup>
      </Typography>
      <div style={{ marginTop: -3 }}>
        <FormControlLabel
          control={(
            <Switch
              checked={isHeating}
              onChange={toggleEnabled}
              disabled={disabled}
              aria-label="heating"
            />
          )}
          label="Enable Heater"
        />
      </div>
    </div>
  )
}

export default enhance(TemperatureSection)
