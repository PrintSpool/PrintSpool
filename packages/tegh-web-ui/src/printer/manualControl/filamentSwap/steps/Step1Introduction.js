import React from 'react'
import {
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import ButtonsFooter from '../ButtonsFooter'

const Step1InstallTegh = ({
  history,
}) => {
  const { t } = useTranslation('filamentSwap')

  return (
    <React.Fragment>
      <Typography variant="h5">
        {t('intro.title')}
      </Typography>
      <Typography variant="body1">
        {t('intro.content')}
      </Typography>
      <ButtonsFooter step={1} history={history} />
    </React.Fragment>
  )
}

export default Step1InstallTegh
