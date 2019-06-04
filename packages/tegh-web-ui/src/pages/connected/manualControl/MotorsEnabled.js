import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Switch,
} from '@material-ui/core'

import useExecGCodes from '../../../common/useExecGCodes'

const MotorsEnabled = ({
  printer,
}) => {
  const toggleMotorsEnabled = useExecGCodes(() => ({
    printer,
    gcodes: [
      { toggleMotorsEnabled: { enable: !printer.motorsEnabled } },
    ],
  }))

  return (
    <Card>
      <CardContent style={{ paddingBottom: 16 }}>
        <Typography variant="subtitle1">
          <div style={{ float: 'right', marginTop: -4 }}>
            <Switch
              checked={printer.motorsEnabled}
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
