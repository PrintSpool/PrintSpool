import React from 'react'

import Typography from '@mui/material/Typography'
import MUILink from '@mui/material/Link'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'

import GettingStartedStyles from './GettingStarted.styles'

const installCmd = (
  'bash <(curl -s https://raw.githubusercontent.com/PrintSpool/PrintSpool/develop/scripts/install)'
);

const GettingStarted = () => {
  const classes = GettingStartedStyles()

  return (
    <div className={classes.root}>
      <StaticTopNavigation />
      <div className={classes.content}>
        <div>
          <Typography variant="h5" paragraph>
            To install Print Spool on your Raspberry Pi or Linux PC
          </Typography>
          <Typography variant="body1" paragraph className={classes.codeInstruction}>
            Copy and paste this line in to your Pi's terminal and hit enter:
          </Typography>
          <code className={classes.code}>
            {installCmd}
          </code>
          {/* <Typography variant="body2" paragraph className={classes.alreadyHavePrint Spool}>
            Already have Print Spool installed?
            {' '}
            <MUILink
              underline="always"
              component={Link}
              to="/get-started/2"
            >
              Skip this step
            </MUILink>
          </Typography> */}
          <Typography variant="body2" paragraph className={classes.dontHaveRaspberryPi}>
            Don't have a Raspberry Pi? Get one from
            {' '}
            <MUILink
              underline="always"
              href="https://www.raspberrypi.org/products/raspberry-pi-3-model-b-plus/"
              target="_blank"
              rel="noopener noreferrer"
            >
              raspberrypi.org
            </MUILink>
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default GettingStarted
