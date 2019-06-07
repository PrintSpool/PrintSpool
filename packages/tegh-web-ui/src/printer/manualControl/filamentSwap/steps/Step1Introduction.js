import React from 'react'
import {
  Typography,
  Button,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import ButtonsFooter from '../ButtonsFooter'

// {t('intro.title')}

const Step1Introduction = ({
  component,
  classes,
  setActiveStep,
}) => {
  const { t } = useTranslation('filamentSwap')

  return (
    <React.Fragment>
      <div className={classes.introRoot}>
        <Typography variant="h6" paragraph id="material-dialog-title">
          {t('title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('intro.content', {
            name: component.name,
            materialTarget: component.heater.materialTarget,
            distance: 100,
          })}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('intro.skipContent')}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setActiveStep(4)}
        >
        {t('intro.skipButton')}
        </Button>
      </div>

      <ButtonsFooter
        skipButton={{
          step: 4,
        }}
      />
    </React.Fragment>
  )
}

export default Step1Introduction
