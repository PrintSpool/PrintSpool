import React, { useEffect, useState } from 'react'

import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import Button from '@material-ui/core/Button'

import { useTranslation } from 'react-i18next'

import { useExecGCodes2 } from '../../../_hooks/useExecGCodes'

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
    bowdenTubeLength = 0,
    filamentSwapFastMoveSpeed,
    filamentSwapFastMoveEnabled,
    filamentSwapExtrudeDistance = 100,
  } = component.configForm.model

  const gcodes = []

  if (filamentSwapFastMoveEnabled) {
    gcodes.push({
      moveBy: {
        distances: { [component.address]: bowdenTubeLength },
        feedrate: filamentSwapFastMoveSpeed,
      },
    })
  }

  gcodes.push({
    moveBy: {
      distances: { [component.address]: filamentSwapExtrudeDistance },
      sync: true,
    },
  })

  const loadFilament = useExecGCodes2(() => ({
    machine,
    gcodes,
    sync: true,
    // Wait for the filament to retract and then go to the next step
    update: next,
  }))

  return (
    <>
      <div>
        { loadFilament.isInitial && (
          <>
            <Typography variant="body1" paragraph>
              {t('loadFilament.instructions.title')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('loadFilament.instructions.details', {
                bowdenTubeLength,
                filamentSwapExtrudeDistance,
              })}
            </Typography>
            <Typography variant="body2" paragraph>
              <b>
                {t('loadFilament.instructions.warningWord')}
                :
                {' '}
              </b>
              {t('loadFilament.instructions.warningContent')}
            </Typography>
            <Button
              color="primary"
              variant="contained"
              onClick={loadFilament.run}
            >
              {t('loadFilament.instructions.button')}
            </Button>
          </>
        )}

        { !loadFilament.isInitial && (
          <>
            <Typography variant="body1" paragraph>
              {t('loadFilament.loading.title')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('loadFilament.loading.details', {
                bowdenTubeLength,
                filamentSwapExtrudeDistance,
              })}
            </Typography>
            <LinearProgress />
          </>
        )}
      </div>
    </>
  )
}

export default Step3Retract
