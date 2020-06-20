import React, { useCallback } from 'react'
import {
  Grid,
  Button,
} from '@material-ui/core'

import useStyle from './JogButtonDistanceButtons.styles'

const JogDistanceButtons = ({
  className,
  distanceOptions,
  input,
}) => {
  const classes = useStyle()

  const onChange = useCallback((event, val) => (
    input.onChange(val)
  ))

  return (
    <Grid item xs={12} className={`${classes.root} ${className}`}>
      { distanceOptions.map(value => (
        <Button
          className={classes.button}
          color={value === input.value ? 'primary' : 'default'}
          onClick={() => onChange(value)}
        >
          {typeof value === 'number' ? `${value}mm` : value}
        </Button>
      )) }
    </Grid>
  )
}

export default JogDistanceButtons
