import React, { useEffect } from 'react'
import {
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import TemperatureChart from '../../TemperatureChart'
import useExecGCodes from '../../../_hooks/useExecGCodes'

import HeatExtruderStyles from './HeatExtruderStyles'

const HeatExtruder = ({
  printerID,
  component,
}) => {
  const classes = HeatExtruderStyles()
  const { t } = useTranslation('filamentSwap')

  const {
    materialTarget,
    currentTemperature,
    targetTemperature,
    history,
  } = component.heater

  const heat = useExecGCodes(() => ({
    printerID,
    gcodes: [
      { toggleHeaters: { heaters: { [component.address]: true }, sync: true } },
    ],
  }))

  // TODO:  is this how you do something on mount?
  useEffect(heat, [])

  return (
    <div className={classes.root}>
      <Typography variant="h5" className={classes.title}>
        {t('heatExtruder.title', {
          currentTemperature: currentTemperature.toFixed(1),
          targetTemperature,
        })}
      </Typography>

      <TemperatureChart
        className={classes.chart}
        data={history}
        materialTarget={materialTarget}
      />
    </div>
  )
}

export default HeatExtruder
