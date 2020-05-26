import React, { useCallback } from 'react'
import {
  Grid,
  BottomNavigation,
  BottomNavigationAction,
} from '@material-ui/core'

const JogDistanceButtons = ({
  className,
  distanceOptions,
  input,
}) => {
  const onChange = useCallback((event, val) => (
    input.onChange(val)
  ))

  return (
    <Grid item xs={12} className={className}>
      <BottomNavigation
        value={input.value}
        onChange={onChange}
      >
        { distanceOptions.map(value => (
          <BottomNavigationAction
            key={value}
            value={value}
            label={typeof value === 'number' ? `${value}mm` : value}
            showLabel
          />
        )) }
      </BottomNavigation>
    </Grid>
  )
}

export default JogDistanceButtons
