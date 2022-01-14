import React, { useState } from 'react'

import Grid from '@mui/material/Grid'

import ArrowForward from '@mui/icons-material/ArrowForward'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import ArrowDownward from '@mui/icons-material/ArrowDownward'

import useJog from '../../_hooks/useJog'

import JogButton from './JogButton'
import JogDistanceButtons from './JogDistanceButtons'
import useContinuousMove from '../../_hooks/useContinuousMove'

const CONTINUOUS = 'Continuous'

const XYJogButtons = ({ machine }) => {
  const distanceOptions = [1, 10, 100, CONTINUOUS]
  const [distance, onChange] = useState(CONTINUOUS)

  const isContinuous = distance === CONTINUOUS

  let jog = useJog({ machine, distance })
  jog = isContinuous ? () => null : jog

  const continuousMove = useContinuousMove({ machine })
  const startContinuous = isContinuous ? continuousMove.start : () => null

  const axes = ['x', 'y']

  return (
    <Grid
      container
      style={{
        flex: 1,
      }}
    >
      <JogButton
        xs={12}
        onClick={jog(axes[1], -1)}
        onMouseDown={startContinuous({ [axes[1]]: { forward: false } })}
      >
        <ArrowUpward />
      </JogButton>
      <JogButton
        xs={4}
        onClick={jog(axes[0], -1)}
        onMouseDown={startContinuous({ [axes[0]]: { forward: false } })}
      >
        <ArrowBack />
      </JogButton>
      <JogButton xs={4} disabled>
        XY
      </JogButton>
      <JogButton
        xs={4}
        onClick={jog(axes[0], 1)}
        onMouseDown={startContinuous({ [axes[0]]: { forward: true } })}
      >
        <ArrowForward />
      </JogButton>
      <JogButton
        xs={12}
        onClick={jog(axes[1], 1)}
        onMouseDown={startContinuous({ [axes[1]]: { forward: true } })}
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

export default XYJogButtons
