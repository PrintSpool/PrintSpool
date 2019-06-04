import React, { useState } from 'react'
import { compose } from 'recompose'
import {
  Card,
  CardContent,
  Grid,
} from '@material-ui/core'
import {
  ArrowForward,
  ArrowBack,
  ArrowUpward,
  ArrowDownward,
} from '@material-ui/icons'

import useJog from '../../../../../common/useJog'

import JogButton from './JogButton'
import JogDistanceButtons from './JogDistanceButtons'

const XYJogButtons = ({ printer }) => {
  const distanceOptions = [1, 10, 50, 100]
  const [distance, onChange] = useState(distanceOptions[0])

  const jog = useJog({ printer, distance })

  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={24}
        >
          <JogButton xs={12} onClick={jog('y', -1)}>
            <ArrowUpward />
          </JogButton>
          <JogButton xs={4} onClick={jog('x', -1)} textAlign="right">
            <ArrowBack />
          </JogButton>
          <JogButton xs={4} disabled>
            XY
          </JogButton>
          <JogButton xs={4} onClick={jog('x', 1)} textAlign="left">
            <ArrowForward />
          </JogButton>
          <JogButton xs={12} onClick={jog('y', 1)}>
            <ArrowDownward />
          </JogButton>
          <JogDistanceButtons
            distanceOptions={distanceOptions}
            input={{
              value: distance,
              onChange,
            }}
          />
        </Grid>
      </CardContent>
    </Card>
  )
}

export default enhance(XYJogButtons)
