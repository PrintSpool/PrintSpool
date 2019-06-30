import React, { useState } from 'react'

import ExtrudeRetractButtons from '../ExtrudeRetractButtons'
import JogDistanceButtons from '../jog/JogDistanceButtons'

import ExtruderButtonsStyles from './ExtruderButtonsStyles'

const ExtruderButtons = ({
  machine,
  component,
  ...buttonProps
}) => {
  const classes = ExtruderButtonsStyles()

  const distanceOptions = [0.1, 1, 10, 50, 100]
  const [distance, onChange] = useState(distanceOptions[2])

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
        {...buttonProps}
      />
    </div>
  )
}

export default ExtruderButtons
