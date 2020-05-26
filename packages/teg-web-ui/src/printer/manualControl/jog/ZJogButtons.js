import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Grid,
} from '@material-ui/core'

import ArrowUpward from '@material-ui/icons/ArrowUpward'
import ArrowDownward from '@material-ui/icons/ArrowDownward'

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
    <Card>
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <JogDistanceButtons
            distanceOptions={distanceOptions}
            input={{
              value: distance,
              onChange,
            }}
          />
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
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ZJogButtons
