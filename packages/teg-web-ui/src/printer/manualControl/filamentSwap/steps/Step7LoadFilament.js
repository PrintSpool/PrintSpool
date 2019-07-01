import React, { useState } from 'react'
import {
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

// import ExtrudeRetractButtons from '../../ExtrudeRetractButtons'
import useExecGCodes from '../../../_hooks/useExecGCodes'

import ExtruderButtons from '../ExtruderButtons'
import ButtonsFooter from '../ButtonsFooter'

import Loading from '../../../../common/Loading'

const Step7LoadFilament = ({
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
      <div className={classes.loadFilamentRoot}>
        <Typography variant="h6" paragraph>
          {t('loadFilament.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('loadFilament.content')}
        </Typography>
        <ExtruderButtons
          machine={machine}
          component={component}
        />
        <Typography variant="body2" paragraph>
          <b>
            {t('loadFilament.warningWord')}
            :
            {' '}
          </b>
          {t('loadFilament.warningTitle')}
        </Typography>
        <Typography variant="body2" paragraph>
          {t('loadFilament.warningContent')}
        </Typography>
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

export default Step7LoadFilament
