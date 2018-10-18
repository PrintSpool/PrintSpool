import React from 'react'
import { ConnectedRouter } from '@d1plo1d/connected-react-router'
import { Route, Switch } from 'react-router'

import { history } from './createTeghReduxStore'

import HostsIndexPage from './pages/hosts/HostsIndex.page'
import AddHostPage from './pages/hosts/AddHost.page'

import ConnectionFrame from './pages/connected/frame/ConnectionFrame'
import QueuePage from './pages/connected/queue/Queue.page'
import ManualControlPage from './pages/connected/manualControl/ManualControl.page'

const Routes = () => (
  <ConnectedRouter history={history}>
    <Switch>
      <Route exact path="/" component={HostsIndexPage} />
      <Route exact path="/connect" component={AddHostPage} />

      <Route
        path="/:hostID/:page?"
        render={({ match }) => (
          <ConnectionFrame match={match}>
            <Route exact path="/:hostID/" component={QueuePage} />
            <Route exact path="/:hostID/:printerID/manual-control" component={ManualControlPage} />
          </ConnectionFrame>
        )}
      />
    </Switch>
  </ConnectedRouter>
)

export default Routes
