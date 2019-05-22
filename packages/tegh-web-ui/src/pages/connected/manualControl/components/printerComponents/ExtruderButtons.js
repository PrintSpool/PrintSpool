import React, { useState } from 'react'
import { compose } from 'recompose'
import {
  Grid,
  Button,
} from '@material-ui/core'

import withJog from '../../higherOrderComponents/withJog'
import JogDistanceButtons from '../jog/JogDistanceButtons'

const enhance = compose(
  withJog,
)

const ExtruderButtons = ({
  printer,
  address,
  jog,
  disabled,
}) => {
  const [distance, onChange] = useState()

  return (
    <Grid
      container
      spacing={8}
    >
      <Grid item sm={6}>
        <JogDistanceButtons
          distanceOptions={[0.1, 1, 10, 50, 100]}
          input={{
            value: distance,
            onChange,
          }}
        />
      </Grid>
      <Grid item sm={6}>
        <div style={{ textAlign: 'right' }}>
          <Button
            variant="contained"
            disabled={disabled}
            onClick={jog(printer.id, address, '-', distance)}
          >
            Retract
          </Button>
          <div style={{ display: 'inline-block', width: '16px' }} />
          <Button
            variant="contained"
            color="primary"
            disabled={disabled}
            onClick={jog(printer.id, address, '+', distance)}
          >
            Extrude
          </Button>
        </div>
      </Grid>
    </Grid>
  )
}

export default enhance(ExtruderButtons)
