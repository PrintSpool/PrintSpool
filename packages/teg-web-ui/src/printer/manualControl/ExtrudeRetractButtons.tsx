import React from 'react'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'

import { useTranslation } from 'react-i18next'

import useJog from '../_hooks/useJog'
import useStyles from './ExtrudeRetractButtons.styles'

const ExtruderButton = ({
  machine,
  component,
  distance,
  isReady,
  buttons = ['retract', 'extrude'],
  ...buttonProps
}) => {
  const classes = useStyles()
  const { t } = useTranslation('extruderButton')

  const jog = useJog({ machine, distance })

  const { targetTemperature, actualTemperature } = component.heater || {}

  // if the actual temperature is more then 20 degrees C bellow a set target temperature
  // then show a cold extrusion warning
  const coldExtrude = component.heater != null && (
    targetTemperature == null
    || (actualTemperature || 0) + 20 < targetTemperature
  )

  let tooltipMessage = "Extruder is too cold"

  if (targetTemperature == null) {
    tooltipMessage = "Extruder is not heating"
  }

  return (
    <Tooltip
      title={tooltipMessage}
      enterDelay={0}
      disableFocusListener={!coldExtrude}
      disableHoverListener={!coldExtrude}
      disableTouchListener={!coldExtrude}
      aria-label="cold-extrude"
    >
      <div className={classes.buttons}>
        {buttons.map(key => (
          <Button
            key={key}
            variant="outlined"
            color={key === 'extrude' ? 'primary' : 'default'}
            disabled={!isReady || coldExtrude}
            onClick={
              jog(component.address, key === 'extrude' ? 1 : -1)
            }
            {...buttonProps}
          >
            {t(`${key}Word`)}
          </Button>
        ))}
      </div>
    </Tooltip>
  )
}

export default ExtruderButton
