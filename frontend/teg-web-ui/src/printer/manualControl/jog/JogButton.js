import React from 'react'

import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'

const JogButton = ({
  textAlign,
  xs,
  children,
  onMouseDown,
  ...props
}) => (
  <Grid item xs={xs}>
    <div style={{ textAlign: textAlign || 'center' }}>
      <IconButton
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        {...props}
        size="large">
        {children}
      </IconButton>
    </div>
  </Grid>
)

export default JogButton
