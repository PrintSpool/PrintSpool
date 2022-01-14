import React, { useState } from 'react'

import Grid from '@mui/material/Grid'

import ArrowUpward from '@mui/icons-material/ArrowUpward'
import ArrowDownward from '@mui/icons-material/ArrowDownward'

import useJog from '../../_hooks/useJog'

import JogButton from './JogButton'
import JogDistanceButtons from './JogDistanceButtons'
import useContinuousMove from '../../_hooks/useContinuousMove'

const CONTINUOUS = 'Continuous'

const ZJogButtons = ({ machine }) => {
  const distanceOptions = [0.1, 1, 10, CONTINUOUS]
  const [distance, onChange] = useState(CONTINUOUS)

  const isContinuous = distance === CONTINUOUS

  let jog = useJog({ machine, distance })
  jog = isContinuous ? () => null : jog

  const continuousMove = useContinuousMove({ machine })
  const startContinuous = isContinuous ? continuousMove.start : () => null

  return (
    <Grid
      container
      style={{
        flex: 1,
      }}
    >
      <JogButton
        xs={12}
        onClick={jog('z', 1)}
        onMouseDown={startContinuous({ z: { forward: true } })}
      >
        <ArrowUpward />
      </JogButton>
      <JogButton
        xs={12}
        disabled
      >
        Z
      </JogButton>
      <JogButton
        xs={12}
        onClick={jog('z', -1)}
        onMouseDown={startContinuous({ z: { forward: false } })}
      >
        <ArrowDownward />
      </JogButton>
      <JogDistanceButtons
        style={{
          marginTop: 8,
        }}
        distanceOptions={distanceOptions}
        input={{
          value: distance,
          onChange,
        }}
      />
    </Grid>
  )
}

export default ZJogButtons
