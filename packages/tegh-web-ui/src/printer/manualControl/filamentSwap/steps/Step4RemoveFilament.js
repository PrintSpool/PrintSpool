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
        Please remove your filament
      </Typography>
      <Typography variant="body1">
        It should now safe to remove the filament from your extruder
        however if the filament does not come out easily you may need to retract it further.
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
