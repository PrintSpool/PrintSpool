import React from 'react'
import gql from 'graphql-tag'
import {
  compose,
  branch,
  renderComponent,
} from 'recompose'
import {
  withStyles,
} from '@material-ui/core'
import { connect } from 'react-redux'

import { LiveSubscription } from 'apollo-react-live-subscriptions'

import TeghApolloProvider from './higherOrderComponents/TeghApolloProvider'

import Drawer, { DrawerFragment } from './components/Drawer'

import setWebRTCPeerActionCreator from '../../../actions/setWebRTCPeer'
import setHostNameActionCreator from '../../../actions/setHostName'

const FRAME_SUBSCRIPTION = gql`
  subscription ConnectionFrameSubscription {
    live {
      patch { op, path, from, value }
      query {
        jobQueue {
          name
        }
        ...DrawerFragment
      }
    }
  }

  # fragments
  ${DrawerFragment}
`

const styles = () => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
    minHeight: '100vh',
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
      setHostName: setHostNameActionCreator,
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

const ConnectionFrame = ({
  classes,
  myIdentity,
  hostIdentity,
  setWebRTCPeer,
  setHostName,
  connected,
  children,
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
    onWebRTCDisconnect={() => setWebRTCPeer(null)}
  >
    <LiveSubscription
      reduxKey="ConnectionFrame"
      subscription={FRAME_SUBSCRIPTION}
      onSubscriptionData={({ subscriptionData }) => {
        setHostName({
          id: hostIdentity.id,
          name: subscriptionData.data.live.query.jobQueue.name,
        })
      }}
    >
      {
        ({ data, loading, error }) => (
          <div className={classes.appFrame}>
            {
              connected && !loading && (
                <Drawer
                  hostIdentity={hostIdentity}
                  printers={data.printers}
                />
              )
            }
            {
              error && (
                <div>
                  {JSON.stringify(error)}
                </div>
              )
            }
            {
              !error && children
            }
          </div>
        )
      }
    </LiveSubscription>
  </TeghApolloProvider>
)

export default enhance(ConnectionFrame)
