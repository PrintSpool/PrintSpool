import React from 'react'
import { compose } from 'recompose'
import { ConnectedRouter } from '@d1plo1d/connected-react-router'
import { Route, Switch } from 'react-router'
import { connect } from 'react-redux'
import TeghApolloProvider from './higherOrderComponents/TeghApolloProvider'

import { history } from './createTeghReduxStore'

import HostsIndexPage from './pages/hosts/HostsIndex.page'
import AddHostPage from './pages/hosts/AddHost.page'
import QueuePage from './pages/queue/Queue.page'

const enhance = compose(
  connect(state => ({
    myIdentity: state.keys.myIdentity,
    hostIdentities: state.keys.hostIdentities,
  })),
)

const Routes = ({
  myIdentity,
  hostIdentities,
}) => (
  <ConnectedRouter history={history}>
    <Switch>
      <Route exact path="/" component={HostsIndexPage} />
      <Route exact path="/connect" component={AddHostPage} />

      <Route
        path="/:id/:page?"
        render={({ match }) => {
          const hostIdentity = hostIdentities.get(match.params.id)

          if (hostIdentity == null) {
            return (
              <div>404 Page Not Found</div>
            )
          }

          return (
            <TeghApolloProvider
              myIdentity={myIdentity.toJS()}
              hostIdentity={hostIdentity.toJS()}
            >
              <Route exact path="/:id" component={QueuePage} />
            </TeghApolloProvider>
          )
        }}
      />
    </Switch>
  </ConnectedRouter>
)

export default enhance(Routes)
