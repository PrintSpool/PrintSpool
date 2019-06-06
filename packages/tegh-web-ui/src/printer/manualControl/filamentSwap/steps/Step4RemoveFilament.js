import React from 'react'
import {
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import ExtrudeRetractButtons from '../../ExtrudeRetractButtons'

import ButtonsFooter from '../ButtonsFooter'

const Step4RemoveFilament = ({
  printer,
  component,
}) => {
  const { t } = useTranslation('filamentSwap')

  return (
    <React.Fragment>
      <Typography variant="h5">
        {t('remove.title')}
      </Typography>
      <Typography variant="body1">
        {t('remove.content')}
      </Typography>

      <ExtrudeRetractButtons
        printer={printer}
        address={component.address}
        extrudeColor="default"
      />

      <ButtonsFooter />
    </React.Fragment>
  )
}

export default Step4RemoveFilament
