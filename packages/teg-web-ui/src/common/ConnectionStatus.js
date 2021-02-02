import React from 'react'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client'

import {
  Typography,
  Button,
} from '@material-ui/core'

import ConnectionStatusStyles from './ConnectionStatusStyles'

const GET_CONNECTION_STATE = gql`
  query {
    isTimedOut @client
    isAttemptingReconnect @client
    secondsTillNextReconnect @client
  }
`

const TRY_RECONNECT_NOW = gql`
  mutation tryReconnectNow {
    tryReconnect @client
  }
`

const ConnectionStatus = ({
  children,
}) => {
  const classes = ConnectionStatusStyles()

  const { data, loading, error } = useQuery(GET_CONNECTION_STATE, {
    pollInterval: 500,
  })

  const [tryReconnectNow] = useMutation(TRY_RECONNECT_NOW)

  if (error) {
    throw error
  }

  if (!loading && data.isTimedOut) {
    return (
      <div className={classes.root}>
        <Typography variant="body1" className={classes.center}>
          Connection Timed Out.
          {
            data.isAttemptingReconnect
              ? ' Attempting to Reconnect...'
              : ` Reconnecting in ${data.secondsTillNextReconnect} seconds...`
          }
          <Button
            onClick={tryReconnectNow}
            variant="contained"
            className={classes.button}
            disabled={data.isAttemptingReconnect}
          >
            Retry Now
          </Button>
        </Typography>
      </div>
    )
  }

  return <>{children}</>
}

export default ConnectionStatus
