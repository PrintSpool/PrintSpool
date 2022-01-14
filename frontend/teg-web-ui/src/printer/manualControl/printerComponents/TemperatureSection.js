import React from 'react'

import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

import { useExecGCodes2 } from '../../_hooks/useExecGCodes'

// import TemperatureSectionStyles from './TemperatureSectionStyles'

const TemperatureSection = ({
  machine,
  component,
  disabled,
  printOverridesOnly,
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

  const toggleHeater = useExecGCodes2((e, enable) => ({
    machineID: machine.id,
    gcodes: [
      { toggleHeaters: { heaters: { [address]: enable } } },
    ],
  }), [id], { throwOnError: false })

  const isHeating = (targetTemperature || 0) > 0

  return (
    <React.Fragment>
      <Typography variant="h4" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
        {actualTemperature == null ? '--' : actualTemperature.toFixed(1)}
        °C /
        <sup style={{ fontSize: '50%' }}>
          {' '}
          { targetTemperature == null && 'OFF' }
          { targetTemperature != null && `${targetTemperature}°C`}
        </sup>
      </Typography>
      {!printOverridesOnly && (
        <div style={{ marginTop: -3 }}>
          <FormControlLabel
            control={(
              <Switch
                checked={isHeating}
                onChange={toggleHeater.run}
                disabled={disabled}
                aria-label="heating"
              />
              )}
            label="Enable Heater"
          />
        </div>
      )}
    </React.Fragment>
  )
}

export default TemperatureSection
