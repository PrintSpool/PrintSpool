import React, { useCallback } from 'react'
import {
  Grid,
  Button,
} from '@material-ui/core'

import useStyle from './JogButtonDistanceButtons.styles'

const JogDistanceButtons = ({
  className,
  style,
  distanceOptions,
  input,
}) => {
  const classes = useStyle()

  return (
    <Grid item xs={12} className={`${classes.root} ${className}`} style={style}>
      { distanceOptions.map(value => (
        <Button
          key={value.toString()}
          className={classes.button}
          color={value === input.value ? 'primary' : 'default'}
          onClick={() => input.onChange(value)}
        >
          {typeof value === 'number' ? `${value}mm` : value}
        </Button>
      )) }
    </Grid>
  )
}

export default JogDistanceButtons
