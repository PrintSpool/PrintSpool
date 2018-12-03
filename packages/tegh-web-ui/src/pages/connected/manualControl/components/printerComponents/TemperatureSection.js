import React from 'react'
import gql from 'graphql-tag'
import { compose, withProps } from 'recompose'
import {
  Typography,
  Switch,
  FormControlLabel,
} from '@material-ui/core'

import withSpoolMacro from '../../../shared/higherOrderComponents/withSpoolMacro'

const enhance = compose(
  withSpoolMacro,
  withProps(({ printer, component, spoolMacro }) => ({
    isHeating: (component.heater.targetTemperature || 0) > 0,
    toggleHeater: (e, val) => {
      spoolMacro({
        printerID: printer.id,
        macro: 'toggleHeater',
        args: { [component.id]: val },
      })
    },
  })),
)

const targetText = (targetTemperature) => {
  if (targetTemperature == null) return 'OFF'
  return `${targetTemperature}°C`
}

const TemperatureSection = ({
  component: {
    heater: {
      currentTemperature,
      targetTemperature,
    },
  },
  isHeating,
  toggleHeater,
  disabled,
}) => (
  <div>
    <Typography variant="h4" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
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
            onChange={toggleHeater}
            disabled={disabled}
            aria-label="heating"
          />
          )}
        label="Enable Heater"
      />
    </div>
  </div>
)

export default enhance(TemperatureSection)
