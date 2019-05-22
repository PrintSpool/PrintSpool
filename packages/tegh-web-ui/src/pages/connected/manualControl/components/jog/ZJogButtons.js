import React, { useState } from 'react'
import { compose } from 'recompose'
import {
  Card,
  CardContent,
  Grid,
} from '@material-ui/core'
import {
  ArrowUpward,
  ArrowDownward,
} from '@material-ui/icons'

import withJog from '../../higherOrderComponents/withJog'
import JogButton from './JogButton'
import JogDistanceButtons from './JogDistanceButtons'

const enhance = compose(
  withJog,
)

const ZJogButtons = ({ printer, jog }) => {
  const [distance, onChange] = useState()

  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={24}
        >
          <JogButton xs={12} onClick={jog(printer.id, 'z', '+', distance)}>
            <ArrowUpward />
          </JogButton>
          <JogButton xs={12} disabled>
            Z
          </JogButton>
          <JogButton xs={12} onClick={jog(printer.id, 'z', '-', distance)}>
            <ArrowDownward />
          </JogButton>
          <JogDistanceButtons
            distanceOptions={[0.1, 1, 10]}
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

export default enhance(ZJogButtons)
