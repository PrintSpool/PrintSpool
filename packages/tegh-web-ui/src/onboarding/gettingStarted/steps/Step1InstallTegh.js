import React, { useContext } from 'react'
import { Link } from 'react-router-dom'

import {
  Typography,
  Link as MaterialUILink,
} from '@material-ui/core'

import Step1InstallTeghStyles from './Step1InstallTeghStyles'

import FileInput from '../../../common/FileInput'

import { UserDataContext } from '../../../UserDataProvider'

import ButtonsFooter from '../ButtonsFooter'

const Step1InstallTegh = ({
  className,
  history,
}) => {
  const classes = Step1InstallTeghStyles()

  const { importUserData } = useContext(UserDataContext)

  const onImportClick = async (files) => {
    await importUserData(files)
    history.push('/')
  }

  return (
    <React.Fragment>
      <div className={className}>
        <div className={classes.root}>
          <Typography variant="h5" paragraph>
            Install Tegh on your Raspberry Pi
          </Typography>
          <Typography variant="body1" paragraph className={classes.intro}>
            Welcome to Tegh, in order to get started we&apos;ll need to install Tegh on a Raspberry Pi 3B or newer.
          </Typography>
          <Typography variant="body1" paragraph className={classes.codeInstruction}>
            To start the installation paste this line in your Pi's terminal and hit enter:
          </Typography>
          <code className={classes.code}>
            sudo apt update && sudo apt install snapd && sudo snap install tegh --beta
          </code>
          <Typography variant="body2" paragraph className={classes.alreadyHaveTegh}>
            Already have Tegh installed?
            {' '}
            <MaterialUILink
              underline="always"
              component={Link}
              to="/get-started/2"
            >
              Skip this step
            </MaterialUILink>
            {' '}
            or
            {' '}
            <MaterialUILink
              underline="always"
              component="label"
            >
              import your user data
              <FileInput
                onClick={onImportClick}
              />
            </MaterialUILink>
            {' '}
            from a backup.
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
    </React.Fragment>
  )
}

export default Step1InstallTegh
