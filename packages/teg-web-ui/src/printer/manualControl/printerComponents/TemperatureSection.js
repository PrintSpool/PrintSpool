import React from 'react'

import Typography from '@material-ui/core/Typography'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import useExecGCodes from '../../_hooks/useExecGCodes'

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

  const toggleHeater = useExecGCodes((e, enable) => ({
    machineID: machine.id,
    gcodes: [
      { toggleHeaters: { heaters: { [address]: enable } } },
    ],
  }), [id])

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
                onChange={toggleHeater}
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
