import React, { useState, useCallback } from 'react'

import {
  Typography,
  Switch,
  FormControlLabel,
  Button,
} from '@material-ui/core'

import useSpoolGCodes from '../../../../../common/useSpoolGCodes'

import TemperatureSectionStyles from './TemperatureSectionStyles'

const TemperatureSection = ({
  printer,
  component,
  disabled,
}) => {
  const {
    id,
    toolhead,
    configForm,
    heater: {
      currentTemperature,
      targetTemperature,
    },
  } = component

  const classes = TemperatureSectionStyles()

  const toggleHeater = useSpoolGCodes((e, enable) => ({
    variables: {
      input: {
        printerID: printer.id,
        gcodes: [`toggleHeater ${JSON.stringify({ [id]: enable })}`],
      },
    },
  }))

  const isHeating = (targetTemperature || 0) > 0
  const targetText = (
    targetTemperature == null ? 'OFF' : `${targetTemperature}°C`
  )

  return (
    <React.Fragment>
      <Typography variant="h4" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
        {currentTemperature.toFixed(1)}
          °C /
        <sup style={{ fontSize: '50%' }}>
          {' '}
          {targetText}
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
    </React.Fragment>
  )
}

export default TemperatureSection
