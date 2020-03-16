import React from 'react'
import { Link } from 'react-router-dom'

import {
  Typography,
  Link as MaterialUILink,
} from '@material-ui/core'

import Step1InstallTegStyles from './Step1InstallTegStyles'

import ButtonsFooter from '../ButtonsFooter'

const Step1InstallTeg = ({
  className,
  history,
}) => {
  const classes = Step1InstallTegStyles()

  return (
    <>
      <div className={className}>
        <div className={classes.root}>
          <Typography variant="h5" paragraph>
            Install Teg on your Raspberry Pi
          </Typography>
          <Typography variant="body1" paragraph className={classes.intro}>
            Welcome to Teg, in order to get started we&apos;ll need to install Teg on a Raspberry Pi 3B or newer.
          </Typography>
          <Typography variant="body1" paragraph className={classes.codeInstruction}>
            To start the installation paste this line in your Pi's terminal and hit enter:
          </Typography>
          <code className={classes.code}>
            sudo apt update && sudo apt install snapd && sudo snap install teg --beta
          </code>
          <Typography variant="body2" paragraph className={classes.alreadyHaveTeg}>
            Already have Teg installed?
            {' '}
            <MaterialUILink
              underline="always"
              component={Link}
              to="/get-started/2"
            >
              Skip this step
            </MaterialUILink>
          </Typography>
          <Typography variant="body2" paragraph className={classes.dontHaveRaspberryPi}>
            Don't have a Raspberry Pi? Get one from
            {' '}
            <MaterialUILink
              underline="always"
              href="https://www.raspberrypi.org/products/raspberry-pi-3-model-b-plus/"
              target="_blank"
              rel="noopener noreferrer"
            >
              raspberrypi.org
            </MaterialUILink>
          </Typography>
        </div>
      </div>
      <ButtonsFooter step={1} history={history} />
    </>
  )
}

export default Step1InstallTeg
