import React, { useEffect } from 'react'
import {
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import ButtonsFooter from '../ButtonsFooter'
import TemperatureChart from '../../TemperatureChart'
import useExecGCodes from '../../../_hooks/useExecGCodes'

import HeatExtruderStyles from './HeatExtruderStyles'

const HeatExtruder = ({
  machine,
  component,
  next,
  active,
}) => {
  const classes = HeatExtruderStyles()
  const { t } = useTranslation('filamentSwap')

  const heatExtruder = useExecGCodes(() => ({
    machine,
    gcodes: [
      { toggleHeaters: { heaters: { [component.address]: true }, sync: true } },
    ],
    // Wait for the extruder to reach temperature and then go to the next step
    update: next,
  }))

  useEffect(() => {
    if (active) heatExtruder()
  }, [active])

  const {
    materialTarget,
    currentTemperature,
    history,
  } = component.heater

  return (
    <React.Fragment>
      <div className={classes.root}>
        <Typography variant="body1" className={classes.title}>
          {t('heatExtruder.title', {
            currentTemperature: (currentTemperature || 0).toFixed(1),
            targetTemperature: (materialTarget || 0).toFixed(1),
          })}
        </Typography>

        <TemperatureChart
          className={classes.chart}
          data={history}
          materialTarget={materialTarget}
          horizontalGridLines
          ticks={4}
        />
      </div>
      <ButtonsFooter
        disabledNext
        disabledBack
      />
    </React.Fragment>
  )
}

export default HeatExtruder
