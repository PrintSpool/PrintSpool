import React from 'react'
import {
  Card,
  CardContent,
  Grid,
  Typography,
} from '@material-ui/core'

import TemperatureSection from './TemperatureSection'
import ExtruderButtons from './ExtruderButtons'

const HeaterControl = ({
  id,
  name,
  isExtruder,
  disabled,
}) => (
  <Card>
    <CardContent>
      <Grid
        container
        spacing={24}
      >
        <Grid item xs={6}>
          <Typography variant="subtitle1">
            {name}
          </Typography>
          <TemperatureSection
            id={id}
            name={name}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={6}>
          {
            isExtruder
            && (
            <ExtruderButtons
              id={id}
              form={`extruder[${id}]`}
              disabled={disabled}
            />
            )
          }
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)

export default HeaterControl
