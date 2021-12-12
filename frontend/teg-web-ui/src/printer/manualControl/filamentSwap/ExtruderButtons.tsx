import React, { useState } from 'react'

import ExtrudeRetractButtons from '../ExtrudeRetractButtons'
import JogDistanceButtons from '../jog/JogDistanceButtons'

import useStyles from './ExtruderButtons.styles'

const ExtruderButtons = ({
  machine,
  component,
  isReady,
  ...buttonProps
}) => {
  const classes = useStyles()

  const CONTINUOUS = 'Continuous'
  const distanceOptions = [1, 10, 50, 100, CONTINUOUS]
  const [distance, onChange] = useState(CONTINUOUS)

  return (
    <div className={classes.root}>
      <JogDistanceButtons
        className={classes.extruderJogDistances}
        distanceOptions={distanceOptions}
        input={{
          value: distance,
          onChange,
        }}
      />
      <ExtrudeRetractButtons
        className={classes.extruderButton}
        machine={machine}
        component={component}
        distance={distance}
        isReady={isReady}
        {...buttonProps}
      />
    </div>
  )
}

export default ExtruderButtons
