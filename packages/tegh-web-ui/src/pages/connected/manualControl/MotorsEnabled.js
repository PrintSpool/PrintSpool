import React from 'react'
import { compose, withProps } from 'recompose'
import {
  Card,
  CardContent,
  Typography,
  Switch,
} from '@material-ui/core'

import withSpoolMacro from '../shared/higherOrderComponents/withSpoolMacro'

const enhance = compose(
  withSpoolMacro,
  withProps(({ spoolMacro, printer }) => ({
    toggleMotorsEnabled: (args) => {
      spoolMacro({
        printerID: printer.id,
        macro: 'toggleMotorsEnabled',
        args,
      })
    },
  })),
)

const MotorsEnabled = ({
  toggleMotorsEnabled,
  printer,
}) => (
  <Card style={{ marginBottom: 16 }}>
    <CardContent style={{ paddingBottom: 16 }}>
      <Typography variant="subtitle1">
        <div style={{ float: 'right', marginTop: -4 }}>
          <Switch
            checked={printer.motorsEnabled}
            onChange={() => {
              toggleMotorsEnabled({ enable: !printer.motorsEnabled })
            }}
            aria-label="motor-power"
          />
        </div>
        Motors Enabled
      </Typography>
    </CardContent>
  </Card>
)

export default enhance(MotorsEnabled)
