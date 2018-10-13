import React from 'react'
import { ConnectedRouter } from '@d1plo1d/connected-react-router'
import { Route, Switch } from 'react-router'

import { history } from './createTeghReduxStore'

import HostsIndexPage from './pages/hosts/HostsIndex.page'
import AddHostPage from './pages/hosts/AddHost.page'

import ConnectedFrame from './pages/connected/frame/ConnectedFrame'
import QueuePage from './pages/connected/queue/Queue.page'

const Routes = () => (
  <ConnectedRouter history={history}>
    <Switch>
      <Route exact path="/" component={HostsIndexPage} />
      <Route exact path="/connect" component={AddHostPage} />

      <Route
        path="/:id/:page?"
        render={({ match }) => (
          <ConnectedFrame hostID={match.params.id}>
            <Route exact path="/:id" component={QueuePage} />
          </ConnectedFrame>
        )}
      />
    </Switch>
  </ConnectedRouter>
)

export default Routes
