import React from 'react'
import { ConnectedRouter } from '@d1plo1d/connected-react-router'
import { Route, Switch } from 'react-router'

import { history } from './createTeghReduxStore'

import HostsIndexPage from './pages/hosts/HostsIndex.page'
import AddHostPage from './pages/hosts/AddHost.page'

import ConnectionFrame from './pages/connected/frame/ConnectionFrame'
import QueuePage from './pages/connected/queue/Queue.page'
import JobPage from './pages/connected/job/Job.page'
import ManualControlPage from './pages/connected/manualControl/ManualControl.page'
import ConfigIndexPage from './pages/connected/config/Index.page'
import ComponentsConfigPage from './pages/connected/config/printerComponents/Index.page'
import MaterialsConfigPage from './pages/connected/config/materials/Index.page'

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
            <Route exact path="/:hostID/jobs/:jobID/" component={JobPage} />
            <Route exact path="/:hostID/:printerID/manual-control/" component={ManualControlPage} />
            <Route exact path="/:hostID/:printerID/config/" component={ConfigIndexPage} />
            <Route exact path="/:hostID/:printerID/config/printer/" component={ConfigIndexPage} />
            <Route exact path="/:hostID/:printerID/config/components/" component={ComponentsConfigPage} />
            <Route exact path="/:hostID/:printerID/config/components/:componentID" component={ComponentsConfigPage} />
            <Route exact path="/:hostID/:printerID/config/components/:componentID/:verb" component={ComponentsConfigPage} />
            <Route exact path="/:hostID/:printerID/config/materials/" component={MaterialsConfigPage} />
            <Route exact path="/:hostID/:printerID/config/materials/:org/:sku" component={MaterialsConfigPage} />
            <Route exact path="/:hostID/:printerID/config/materials/:componentID/:verb" component={MaterialsConfigPage} />
          </ConnectionFrame>
        )}
      />
    </Switch>
  </ConnectedRouter>
)

export default Routes
