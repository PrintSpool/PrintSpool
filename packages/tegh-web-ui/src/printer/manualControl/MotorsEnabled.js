import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Switch,
} from '@material-ui/core'

import useExecGCodes from '../_hooks/useExecGCodes'

const MotorsEnabled = ({
  machine,
}) => {
  const toggleMotorsEnabled = useExecGCodes(() => ({
    machine,
    gcodes: [
      { toggleMotorsEnabled: { enable: !machine.motorsEnabled } },
    ],
  }))

  return (
    <Card>
      <CardContent style={{ paddingBottom: 16 }}>
        <Typography variant="subtitle1">
          <div style={{ float: 'right', marginTop: -4 }}>
            <Switch
              checked={machine.motorsEnabled}
              onChange={toggleMotorsEnabled}
              aria-label="motor-power"
            />
          </div>
          Motors Enabled
        </Typography>
      </CardContent>
    </Card>
  )
}

export default MotorsEnabled
