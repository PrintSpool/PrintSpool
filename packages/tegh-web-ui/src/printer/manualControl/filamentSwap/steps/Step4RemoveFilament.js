import React from 'react'
import {
  Typography,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import ExtruderButtons from '../ExtruderButtons'

import ButtonsFooter from '../ButtonsFooter'

const Step4RemoveFilament = ({
  printer,
  component,
  classes,
}) => {
  const { t } = useTranslation('filamentSwap')

  return (
    <React.Fragment>
      <div className={classes.removeFilamentRoot}>
        <Typography variant="h6" paragraph>
          {t('remove.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('remove.content')}
        </Typography>

        <ExtruderButtons
          printer={printer}
          component={component}
        />
      </div>

      <ButtonsFooter
        backTo={0}
      />
    </React.Fragment>
  )
}

export default Step4RemoveFilament
