import React, { useState } from 'react'
import Typography from '@mui/material/Typography'

import { useTranslation } from 'react-i18next'

// import ExtrudeRetractButtons from '../../ExtrudeRetractButtons'
import useExecGCodes from '../../../_hooks/useExecGCodes'

import ExtruderButtons from '../ExtruderButtons'
import ButtonsFooter from '../ButtonsFooter'

import Loading from '../../../../common/Loading'

const Step7adjustNewFilament = ({
  machine,
  component,
  next,
  classes,
}) => {
  const { t } = useTranslation('filamentSwap')

  const [saving, setSaving] = useState(false)

  const disableExtruder = useExecGCodes(() => {
    setSaving(true)

    return {
      machine,
      gcodes: [
        { toggleHeaters: { heaters: { [component.address]: false } } },
      ],
      // Wait for the extruder to reach temperature and then go to the next step
      update: next,
    }
  }, [machine, component.address])

  return (
    <React.Fragment>
      <div className={classes.adjustNewFilamentRoot}>
        <Typography variant="h6" paragraph>
          {t('adjustNewFilament.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('adjustNewFilament.content')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('adjustNewFilament.adjustInstructions')}
        </Typography>
        <ExtruderButtons
          machine={machine}
          component={component}
          isReady={machine?.status === 'READY'}
        />
      </div>

      { saving && (
        <Loading noText className={classes.saving} transitionDelay={200} />
      )}

      <ButtonsFooter
        backTo={-2}
        onClickNext={disableExtruder}
        disabledNext={saving}
      />
    </React.Fragment>
  )
}

export default Step7adjustNewFilament
