import React from 'react'
import {
  compose,
  branch,
  renderComponent,
} from 'recompose'
import {
  Typography,
  withStyles,
} from '@material-ui/core'
import { connect } from 'react-redux'
import Loader from 'react-loader-advanced'

import { LiveSubscription } from 'apollo-react-live-subscriptions'

import TeghApolloProvider from './higherOrderComponents/TeghApolloProvider'

import Drawer from './components/Drawer'
import ConnectingPage from './Connecting.page'

import setWebRTCPeerActionCreator from '../../../actions/setWebRTCPeer'

const styles = () => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
    minHeight: '100vh',
  },
  flex: {
    flex: 1,
  },
})

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  connect(
    (state, ownProps) => {
      const { hostID } = ownProps.match.params
      const { myIdentity, hostIdentities } = state.keys

      return {
        myIdentity,
        hostIdentity: hostIdentities.get(hostID),
        connected: state.webRTC.peer != null,
      }
    },
    {
      setWebRTCPeer: setWebRTCPeerActionCreator,
    },
  ),
  branch(
    props => props.hostIdentity == null,
    renderComponent(() => (
      <div>404 Page Not Found</div>
    )),
  ),
  branch(
    props => props.myIdentity == null,
    renderComponent(() => (
      <div>Connecting</div>
    )),
  ),
)

const connectionFrame = PageComponent => ({
  classes,
  myIdentity,
  hostIdentity,
  variables,
  subscription,
  setWebRTCPeer,
  connected,
}) => (
  <TeghApolloProvider
    myIdentity={myIdentity}
    hostIdentity={hostIdentity}
    onWebRTCConnect={(webRTCPeer) => {
      // set the web RTC after the data is done loading so that the
      // ConnectingPage doesn't flicker to the loading message at the last
      // second.
      // TODO: migrate to Apollo's redux cache and set isConnecting based
      // on when Apollo actually loads the data
      setTimeout((() => setWebRTCPeer(webRTCPeer)), 50)
    }}
  >
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

          // TODO: load printers from Apollo redux cache during page loads
          const printers = (data||{}).printers || []

          return (
            <div className={classes.appFrame}>
              <Drawer
                hostIdentity={hostIdentity}
                printers={printers}
              />
              <Loader
                show={loading}
                message={(
                  <Typography variant="h4" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                    Loading...
                  </Typography>
                )}
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
            </div>
          )
        }
      }
    </LiveSubscription>
  </TeghApolloProvider>
)

export default compose(enhance, connectionFrame)
