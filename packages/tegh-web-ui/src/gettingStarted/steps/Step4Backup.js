import React, { useContext, useEffect, useMemo } from 'react'

import {
  Button,
  Typography,
} from '@material-ui/core'

import { UserDataContext } from '../../UserDataProvider'

import Step4BackupStyles from './Step4BackupStyles'

import ButtonsFooter from '../ButtonsFooter'

const Step4Backup = ({
  className,
  history,
  invite,
  data,
}) => {
  const classes = Step4BackupStyles()

  const { addHost, userData } = useContext(UserDataContext)

  useEffect(() => {
    addHost({ invite, name: data.jobQueue.name })
  }, [])

  const userDataURL = useMemo(() => {
    const json = JSON.stringify(userData)
    const blob = new Blob([json], { type: 'octet/stream' })
    const url = window.URL.createObjectURL(blob)
    return url
  })

  return (
    <React.Fragment>
      <div className={className}>
        <div className={classes.root}>
          <Typography variant="h6" paragraph>
            Your 3D Printer is ready to configure
          </Typography>
          <Typography variant="body1" paragraph>
            Your account has been created but you may need to import it again in
            the future.
          </Typography>
          <Typography variant="body1" paragraph>
            To prevent data loss please save a backup before you continue.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => history.push('/')}
            component={props => (
              <a href={userDataURL} {...props}>
                {props.children}
              </a>
            )}
          >
            Download User Data Backup
          </Button>
          { /* TODO: User / Printer Setup */ }
        </div>
      </div>
      <ButtonsFooter step={4} disable history={history} />
    </React.Fragment>
  )
}

export default Step4Backup
