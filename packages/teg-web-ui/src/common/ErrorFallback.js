import React from 'react'

import {
  Typography,
  Button,
} from '@material-ui/core'

import { CONNECTION_TIMEOUT } from 'graphql-things'

import ErrorFallbackStyles from './ErrorFallbackStyles'

// gql`
//   query {
//     isConnected @client
//     nextReconnectAttempt @client
//   }
// `

const ErrorFallback = ({ error }) => {
  const classes = ErrorFallbackStyles()

  if (error.code === CONNECTION_TIMEOUT) {
    return (
      <div>
        Connection Timed Out
        <Button onClick={() => null}>
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
      <div className={classes.stack}>
        {
          error.stack.split('\n').map((line, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Typography variant="body2" key={i}>
              {line}
            </Typography>
          ))
        }
      </div>
    </div>
  )
}

export default ErrorFallback
