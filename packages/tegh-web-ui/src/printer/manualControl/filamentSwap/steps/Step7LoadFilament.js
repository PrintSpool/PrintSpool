import React from 'react'
import {
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import ExtrudeRetractButtons from '../../ExtrudeRetractButtons'
import useExecGCodes from '../../../_hooks/useExecGCodes'

import ButtonsFooter from '../ButtonsFooter'

const Step7LoadFilament = ({
  printer,
  component,
  next,
}) => {
  const { t } = useTranslation('filamentSwap')

  const disableExtruder = useExecGCodes(() => ({
    printer,
    gcodes: [
      { toggleHeaters: { heaters: { [component.address]: false } } },
    ],
    // Wait for the extruder to reach temperature and then go to the next step
    update: next,
  }))

  return (
    <React.Fragment>
      <Typography variant="h5" paragraph>
        {t('loadFilament.title')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('loadFilament.content')}
      </Typography>
      <Typography variant="body2" paragraph>
        <b>
          {t('loadFilament.warningWord')}
          :
        </b>
        {t('loadFilament.warningContent')}
      </Typography>

      <ExtrudeRetractButtons
        printer={printer}
        address={component.address}
        extrudeColor="default"
      />

      <ButtonsFooter onClickNext={disableExtruder} />
    </React.Fragment>
  )
}

export default Step7LoadFilament
