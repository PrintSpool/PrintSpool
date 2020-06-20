import React from 'react'

import {
  Typography,
  Switch,
  FormControlLabel,
} from '@material-ui/core'

import useExecGCodes from '../../_hooks/useExecGCodes'

// import TemperatureSectionStyles from './TemperatureSectionStyles'

const TemperatureSection = ({
  machine,
  component,
  disabled,
}) => {
  const {
    id,
    address,
    heater: {
      actualTemperature,
      targetTemperature,
    },
  } = component

  // const classes = TemperatureSectionStyles()

  const toggleHeater = useExecGCodes((e, enable) => ({
    machineID: machine.id,
    gcodes: [
      { toggleHeaters: { heaters: { [address]: enable } } },
    ],
  }), [id])

  const isHeating = (targetTemperature || 0) > 0
  const targetText = (
    targetTemperature == null ? 'OFF' : `${targetTemperature}°C`
  )

  return (
    <React.Fragment>
      <Typography variant="h4" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
        {actualTemperature == null ? '--' : actualTemperature.toFixed(1)}
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
