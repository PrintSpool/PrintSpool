import React from 'react'
import {
  Grid,
  BottomNavigation,
  BottomNavigationAction,
} from '@material-ui/core'

const JogDistanceButtons = distanceOptions => ({ input }) => (
  <Grid item xs={12}>
    <BottomNavigation
      value={input.value}
      onChange={(event, val) => input.onChange(val)}
    >
      { distanceOptions.map(value => (
        <BottomNavigationAction
          key={value}
          value={value}
          label={`${value}mm`}
          showLabel
        />
      )) }
    </BottomNavigation>
  </Grid>
)

export default JogDistanceButtons
