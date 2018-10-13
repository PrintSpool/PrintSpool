import React from 'react'
import {
  compose,
  branch,
  renderComponent,
} from 'recompose'
import { withStyles } from '@material-ui/core'
import { connect } from 'react-redux'

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
)

const ConnectedFrame = ({
  children,
  classes,
  myIdentity,
  hostIdentity,
}) => (
  <TeghApolloProvider
    myIdentity={myIdentity}
    hostIdentity={hostIdentity}
  >
    <div>
      <div className={classes.appFrame}>
        <Drawer hostIdentity={hostIdentity} />
        <div className={classes.flex}>
          { children }
        </div>
      </div>
    </div>
  </TeghApolloProvider>
)

export default enhance(ConnectedFrame)
