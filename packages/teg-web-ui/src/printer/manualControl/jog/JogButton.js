import React from 'react'
import {
  Grid,
  IconButton,
} from '@material-ui/core'

const JogButton = ({
  textAlign,
  xs,
  children,
  ...props
}) => (
  <Grid item xs={xs}>
    <div style={{ textAlign: textAlign || 'center' }}>
      <IconButton {...props}>
        {children}
      </IconButton>
    </div>
  </Grid>
)

export default JogButton
