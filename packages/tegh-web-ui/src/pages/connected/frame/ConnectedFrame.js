import React from 'react'
import {
  compose,
  branch,
  renderComponent,
  renderFromProp,
} from 'recompose'
import { withStyles } from '@material-ui/core'
import { connect } from 'react-redux'

import LiveSubscription from 'apollo-react-live-subscriptions'

import TeghApolloProvider from './higherOrderComponents/TeghApolloProvider'

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
  withStyles(styles, { withTheme: true }),
  connect((state, ownProps) => ({
    myIdentity: state.keys.myIdentity,
    hostIdentity: state.keys.hostIdentities.get(ownProps.hostID),
  })),
  branch(
    props => props.myIdentity == null,
    renderComponent(() => (
      <div>Connecting</div>
    )),
  ),
  branch(
    props => props.hostIdentity == null,
    renderComponent(() => (
      <div>404 Page Not Found</div>
    )),
  ),
  renderFromProp('PageComponent'),
)

const ConnectedFrame = ({
  classes,
  myIdentity,
  hostIdentity,
  variables,
  subscription,
  PageComponent,
}) => (
  <TeghApolloProvider
    myIdentity={myIdentity}
    hostIdentity={hostIdentity}
  >
    <LiveSubscription
      variables={variables}
      subscription={subscription}
    >
      {
        ({ data, loading, error }) => {
          if (loading) {
            return (
              <div>
                Loading...
              </div>
            )
          }
          if (error) return <div>{ JSON.stringify(error) }</div>

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

export default enhance(ConnectedFrame)
