import React from 'react'
import Loader from 'react-loader-advanced'

import { makeStyles } from '@material-ui/core/styles'

import { gql } from '@apollo/client'

import { LiveSubscription } from '../../../common/LiveSubscription'

// import ConnectingPage from '../Connecting.page'

export const NULL_SUBSCRIPTION = gql`
  subscription JobQueueSubscription {
    live {
      patch { op, path, from, value }
      query {
        machines {
          id
        }
      }
    }
  }
`

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  flex: {
    flex: 1,
  },
}))

const withLiveData = PageComponent => ({
  variables,
  subscription,
  // connected,
  ...props
}) => {
  const classes = useStyles()

  return (
    <LiveSubscription
      variables={variables}
      subscription={subscription}
    >
      {
        ({ data, loading, error }) => {
          if (error) {
            throw error
          }

          // if (!connected) return <ConnectingPage />

          return (
            <Loader
              show={loading}
              style={{
                flex: 1,
              }}
              backgroundStyle={{
                backgroundColor: 'inherit',
              }}
              contentStyle={{
                display: 'flex',
                flexWrap: 'wrap',
              }}
            >
              <div className={classes.flex}>
                {
                  !loading && (
                    <PageComponent
                      {...props}
                      {...data}
                    />
                  )
                }
              </div>
            </Loader>
          )
        }
      }
    </LiveSubscription>
  )
}

export default withLiveData
