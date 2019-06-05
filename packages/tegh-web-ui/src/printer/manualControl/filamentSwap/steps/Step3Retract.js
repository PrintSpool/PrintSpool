import React, { useEffect } from 'react'
import {
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import useExecGCodes from '../../../_hooks/useExecGCodes'

import ButtonsFooter from '../ButtonsFooter'

const distance = 100

const Step3Retract = ({
  printer,
  component,
  next,
}) => {
  const { t } = useTranslation('filamentSwap')

  const retractFilament = useExecGCodes(() => ({
    printer,
    gcodes: [
      { moveBy: { distances: { [component.address]: distance } } },
    ],
    // Wait for the filament to retract and then go to the next step
    update: next,
  }))

  useEffect(retractFilament, [])

  return (
    <React.Fragment>
      <Typography variant="h5">
        {t('retract.title', { distance })}
      </Typography>

      <ButtonsFooter disabledNext />
    </React.Fragment>
  )
}

export default Step3Retract
