import React from 'react'
import {
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import ButtonsFooter from '../ButtonsFooter'

const Step1Introduction = () => {
  const { t } = useTranslation('filamentSwap')

  return (
    <React.Fragment>
      <Typography variant="h5">
        {t('intro.title')}
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
