import React from 'react'

import {
  Typography,
  Button,
} from '@material-ui/core'

import { CONNECTION_TIMEOUT } from 'graphql-things'

import ErrorFallbackStyles from './ErrorFallback.styles'

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

  // GraphQL Errors use error.location and JS Errors use error.stack
  const stack = error.stack == null ? error.location : error.stack.split('\n')

  return (
    <div className={classes.root}>
      <Typography variant="h5" className={classes.header}>
        {`Error: ${error.message}`}
      </Typography>
      { error.path && (
        <Typography variant="h6" className={classes.path}>
          {error.path}
        </Typography>
      )}
      <div className={classes.stack}>
        {
          stack.map((line, i) => (
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
