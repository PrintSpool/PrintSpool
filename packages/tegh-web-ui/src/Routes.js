import React from 'react'
import { ConnectedRouter } from '@d1plo1d/connected-react-router'
import { Route, Switch } from 'react-router'
import { ApolloProvider } from 'react-apollo'

import { history } from './createTeghReduxStore'

import HostsIndexPage from './pages/hosts/HostsIndex.page'
import AddHostPage from './pages/hosts/AddHost.page'
import QueuePage from './pages/queue/Queue.page'

const Routes = () => (
  <ConnectedRouter history={history}>
    <Switch>
      <Route exact path="/" component={HostsIndexPage} />
      <Route exact path="/connect" component={AddHostPage} />

      <Route
        path="/:id/:page?"
        render={() => (
          <div>
            <ApolloProvider client={ apolloClient }>
              <Route exact path="/:id" component={QueuePage} />
            </ApolloProvider>
          </div>
        )}
      />
    </Switch>
  </ConnectedRouter>
)

export default Routes
