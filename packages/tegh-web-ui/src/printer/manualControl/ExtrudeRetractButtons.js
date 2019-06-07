import React from 'react'
import {
  Button,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import useJog from '../_hooks/useJog'

const ExtruderButton = ({
  printer,
  component,
  distance,
  buttons = ['retract', 'extrude'],
  ...buttonProps
}) => {
  const { t } = useTranslation('extruderButton')

  const jog = useJog({ printer, distance })

  return (
    <React.Fragment>
      {buttons.map(key => (
        <Button
          key={key}
          variant="contained"
          color={key === 'extrude' ? 'primary' : 'default'}
          onClick={
            jog(component.address, key === 'extrude' ? 1 : -1)
          }
          {...buttonProps}
        >
          {t(`${key}Word`)}
        </Button>
      ))}
    </React.Fragment>
  )
}

export default ExtruderButton
