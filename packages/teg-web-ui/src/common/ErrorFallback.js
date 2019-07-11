import React from 'react'

import {
  Typography,
  Button,
} from '@material-ui/core'

import { CONNECTION_TIMEOUT } from 'graphql-things'

import ErrorFallbackStyles from './ErrorFallbackStyles'

gql`
  query {
    isConnected @client
    nextReconnectAttempt @client
  }
`

const ErrorFallback = ({ error }) => {
  const classes = ErrorFallbackStyles()
  useContext()

  if (error.code === CONNECTION_TIMEOUT) {
    return (
      <div>
        Connection Timed Out
        <Button onClick={() => }>
          Reconnect
        </Button>
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <Typography variant="h5" className={classes.header}>
        {`Error: ${error.message}`}
      </Typography>
      {
        error.stack.split('\n').map((line, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Typography variant="body2" key={i}>
            {line}
          </Typography>
        ))
      }
    </div>
  )
}

export default ErrorFallback
