import React from 'react'
import Loader from 'react-loader-advanced'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import {
  withStyles,
} from '@material-ui/core'

import { LiveSubscription } from 'apollo-react-live-subscriptions'

import ConnectingPage from '../Connecting.page'

const styles = () => ({
  flex: {
    flex: 1,
  },
})

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  connect(
    state => ({
      connected: state.webRTC.peer != null,
    }),
  ),
)

const withLiveData = PageComponent => ({
  variables,
  subscription,
  connected,
  classes,
}) => (
  <LiveSubscription
    variables={variables}
    subscription={subscription}
  >
    {
      ({ data, loading, error }) => {
        if (error) {
          return (
            <div>
              {JSON.stringify(error)}
            </div>
          )
        }

        if (!connected) return <ConnectingPage />

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

export default compose(enhance, withLiveData)
