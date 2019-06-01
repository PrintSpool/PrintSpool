import React, { useState, useCallback } from 'react'

import {
  Typography,
  Switch,
  FormControlLabel,
  Button,
} from '@material-ui/core'

import useSpoolGCodes from '../../../../../common/useSpoolGCodes'

import FilamentSwapDialog from './FilamentSwapDialog'

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
  const [filamentSwapDialogOpen, setFilamentSwapDialogOpen] = useState(false)

  const openFilamentSwapDialog = useCallback(() => setFilamentSwapDialogOpen(true))
  const closeFilamentSwapDialog = useCallback(() => setFilamentSwapDialogOpen(false))

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
        {toolhead && (
          <Button
            className={classes.materialButton}
            onClick={openFilamentSwapDialog}
          >
            {(toolhead.currentMaterial || { name: 'no material' }).name}
            <FilamentSwapDialog
              onClose={closeFilamentSwapDialog}
              open={filamentSwapDialogOpen}
              printer={printer}
              component={component}
            />
          </Button>
        )}
      </div>
    </React.Fragment>
  )
}

export default TemperatureSection
