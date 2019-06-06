import React from 'react'
import {
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import ButtonsFooter from '../ButtonsFooter'

// {t('intro.title')}

const Step1Introduction = ({
  component,
}) => {
  const { t } = useTranslation('filamentSwap')

  return (
    <React.Fragment>
      <Typography variant="h6" id="material-dialog-title">
        {t('title', component)}
      </Typography>
      <Typography variant="body1">
        {t('intro.content')}
      </Typography>

      <ButtonsFooter
        skipButton={{
          step: 4,
          label: t('intro.skipToFilamentSelection'),
        }}
      />
    </React.Fragment>
  )
}

export default Step1Introduction
