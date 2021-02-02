import React, { useContext } from 'react'

import {
  // Button,
  Typography,
} from '@material-ui/core'

import Step4BackupStyles from './Step4BackupStyles'

import ButtonsFooter from '../ButtonsFooter'
import { TegApolloContext } from '../../../webrtc/TegApolloProvider'

const Step4Backup = ({
  className,
  history,
}) => {
  const classes = Step4BackupStyles()
  const { slug } = useContext(TegApolloContext)

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
      <ButtonsFooter step={4} nextURL={`/q/${slug}/`} history={history} />
    </React.Fragment>
  )
}

export default Step4Backup
