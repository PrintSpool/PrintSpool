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
        Load the Filament
      </Typography>
      <Typography variant="body1" paragraph>
        Please insert the new filament and slowly extrude it until it until it begins to push out of the nozzle.
      </Typography>
      <Typography variant="body2" paragraph>
        <b>Warning:</b> Filaments can easily jam while loading. Watch that filament is fed into the printer with each extrusion. If the filament jams please retract the filament and determine why the jam occured. Continuing to extrude a jammed filament may damage your printer.
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
