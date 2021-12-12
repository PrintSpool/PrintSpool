import React from 'react'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'

import { useTranslation } from 'react-i18next'

import useContinuousMove from '../_hooks/useContinuousMove'
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

  const CONTINUOUS = 'Continuous'
  const isContinuous = distance === CONTINUOUS

  const continuousMove = useContinuousMove({
    machine,
    feedrateMultiplier: 1,
  })
  const startContinuous = isContinuous ? continuousMove.start : () => null

  let jog = useJog({ machine, distance })
  jog = isContinuous ? () => null : jog

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

  const buttonsJSX = (
    <div className={classes.buttons}>
      {buttons.map(key => (
        <Button
          key={key}
          variant="outlined"
          // color={key === 'extrude' ? 'primary' : 'default'}
          disabled={!isReady || coldExtrude}
          onClick={jog(component.address, key === 'extrude' ? 1 : -1)}
          onMouseDown={startContinuous({ [component.address]: { forward: key === 'extrude' } })}
          {...buttonProps}
        >
          {t(`${key}Word`)}
        </Button>
      ))}
    </div>
  )

  if (!coldExtrude) {
    return buttonsJSX
  }

  return (
    <Tooltip
      title={tooltipMessage}
      enterDelay={0}
      aria-label="cold-extrude"
    >
      {buttonsJSX}
    </Tooltip>
  )
}

export default ExtruderButton
