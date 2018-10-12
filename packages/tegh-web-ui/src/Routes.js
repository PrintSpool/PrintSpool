import React from 'react'
import { ConnectedRouter } from '@d1plo1d/connected-react-router'
import { Route, Switch } from 'react-router'

import { history } from './createTeghReduxStore'

import NewConnectionPage from './pages/newConnection/NewConnectionPage'

const Routes = () => (
  <ConnectedRouter history={history}>
    <Switch>
      <Route exact path="/" component={NewConnectionPage} />
    </Switch>
  </ConnectedRouter>
)

export default Routes
