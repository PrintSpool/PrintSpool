import React from 'react'
import {
  compose,
  branch,
  renderComponent,
} from 'recompose'
import { withStyles } from '@material-ui/core'
import { connect } from 'react-redux'

import { LiveSubscription } from 'apollo-react-live-subscriptions'

import TeghApolloProvider from './higherOrderComponents/TeghApolloProvider'

// TODO: webRTC Peer in redux
// import setWebRTCPeer from '../../../actions/setWebRTCPeer'
const setWebRTCPeer = () => {}

import Drawer from './components/Drawer'

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
  // withStyles(styles, { withTheme: true }),
  connect(
    (state, ownProps) => {
      const { hostID } = ownProps.match.params
      const { myIdentity, hostIdentities } = state.keys

      return {
        myIdentity,
        hostIdentity: hostIdentities.get(hostID),
      }
    },
    {
      setWebRTCPeer,
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
}) => (
  <TeghApolloProvider
    myIdentity={myIdentity}
    hostIdentity={hostIdentity}
    onWebRTCConnect={setWebRTCPeer}
  >
    <LiveSubscription
      variables={variables}
      subscription={subscription}
    >
      {
        ({ data, loading, error }) => {
          console.log(data, loading, error)

          if (error) {
            return (
              <div>
                {JSON.stringify(error)}
              </div>
            )
          }

          if (loading) {
            return (
              <div>
                Loading...
              </div>
            )
          }

          return (
            <div className={classes.appFrame}>
              <Drawer
                hostIdentity={hostIdentity}
                printersListForDrawer={data.printersListForDrawer}
              />
              <div className={classes.flex}>
                <PageComponent
                  {...data}
                />
              </div>
            </div>
          )
        }
      }
    </LiveSubscription>
  </TeghApolloProvider>
)

export default compose(enhance, connectionFrame)
