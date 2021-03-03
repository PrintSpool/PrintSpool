import React, { useEffect } from 'react'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'

import { useTranslation } from 'react-i18next'

import useExecGCodes from '../../../_hooks/useExecGCodes'

import ButtonsFooter from '../ButtonsFooter'

const Step3Retract = ({
  machine,
  component,
  next,
  classes,
  active,
}) => {
  const { t } = useTranslation('filamentSwap')

  const {
    bowdenTubeLength,
    filamentSwapFastMoveSpeed,
    filamentSwapFastMoveEnabled,
    filamentSwapExtrudeDistance,
  } = component.configForm.model

  const distance = filamentSwapExtrudeDistance + bowdenTubeLength

  const retractFilament = useExecGCodes(() => ({
    machine,
    gcodes: [
      {
        moveBy: {
          distances: { [component.address]: -distance },
          feedrate: filamentSwapFastMoveEnabled ? filamentSwapFastMoveSpeed : null,
          sync: true,
        },
      },
    ],
    sync: true,
    // Wait for the filament to retract and then go to the next step
    update: next,
  }))

  useEffect(() => {
    if (active) retractFilament()
  }, [active])

  return (
    <React.Fragment>
      <div className={classes.retractRoot}>
        <Typography variant="body1" paragraph>
          {t('retract.title', {
            distance,
            targetTemperature: component.heater.targetTemperature,
          })}
        </Typography>
        <LinearProgress />
      </div>

      <ButtonsFooter disabledNext />
    </React.Fragment>
  )
}

export default Step3Retract
