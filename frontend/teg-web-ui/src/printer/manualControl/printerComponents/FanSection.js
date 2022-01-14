import React, { useCallback } from 'react'

import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

const FanSection = ({
  component: {
    address,
    speedController: {
      enabled,
      targetSpeed,
    },
  },
  execGCodes,
  disabled,
}) => {
  const onChange = useCallback((e, enable) => execGCodes({
    gcodes: [
      { toggleFans: { fans: { [address]: enable } } },
    ],
    override: true,
  }), [address])

  return (
    <div style={{
      textAlign: 'right',
    }}>
      <Typography variant="h4" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
        {targetSpeed == null ? 'OFF' : `${targetSpeed.toFixed(1)}%`}
      </Typography>
      <div style={{ marginTop: -3 }}>
        <FormControlLabel
          control={(
            <Switch
              checked={enabled}
              onChange={onChange}
              disabled={disabled}
              aria-label="enable-fan"
            />
            )}
          label="Enable Fan"
        />
      </div>
    </div>
  )
}

export default FanSection
