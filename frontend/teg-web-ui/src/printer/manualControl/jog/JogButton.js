import React from 'react'
import {
  Grid,
  IconButton,
} from '@material-ui/core'

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
      >
        {children}
      </IconButton>
    </div>
  </Grid>
)

export default JogButton
