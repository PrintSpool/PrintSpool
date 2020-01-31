import React from 'react'

import {
  // Button,
  Typography,
} from '@material-ui/core'

import Step4BackupStyles from './Step4BackupStyles'

import ButtonsFooter from '../ButtonsFooter'

const Step4Backup = ({
  className,
  history,
}) => {
  const classes = Step4BackupStyles()

  return (
    <React.Fragment>
      <div className={className}>
        <div className={classes.root}>
          <Typography variant="h6" paragraph>
            Your 3D Printer is ready to use
          </Typography>
          { /* TODO: User / Printer Setup */ }
        </div>
      </div>
      <ButtonsFooter step={4} history={history} />
    </React.Fragment>
  )
}

export default Step4Backup
