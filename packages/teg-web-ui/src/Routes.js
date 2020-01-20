import React from 'react'
import { Route, Switch } from 'react-router'

// import { UserDataContext } from './UserDataProvider'
import { useAuth0 } from './common/auth/auth0'

import LandingPage from './onboarding/landingPage/LandingPage'

import Home from './printer/home/Home'
import Terminal from './printer/terminal/Terminal'

import ConnectionFrame from './printer/common/frame/ConnectionFrame'
import QueuePage from './printer/queue/Queue.page'
import JobPage from './printer/job/Job.page'

const GettingStarted = React.lazy(() => (
  import('./onboarding/gettingStarted/GettingStarted')
))

const GraphQLPlayground = React.lazy(() => (
  import('./printer/graphqlPlayground/GraphQLPlayground')
))

const PrintDialog = React.lazy(() => (
  import('./printer/printDialog/PrintDialog')
))

const ManualControlPage = React.lazy(() => (
  import('./printer/manualControl/ManualControl.page')
))
const FilamentSwapDialog = React.lazy(() => (
  import('./printer/manualControl/filamentSwap/FilamentSwapDialog')
))

const ConfigIndexPage = React.lazy(() => (
 import('./printer/config/Index.page')
))
const ComponentsConfigPage = React.lazy(() => (
 import('./printer/config/printerComponents/Index.page')
))
const MaterialsConfigPage = React.lazy(() => (
 import('./printer/config/materials/Index.page')
))
const PluginsConfigPage = React.lazy(() => (
 import('./printer/config/plugins/Plugins')
))

const Routes = () => {
  const { isAuthenticated, loading } = useAuth0()

  if (loading) {
    return <div></div>
  }

  return (
    <Switch>
      { !isAuthenticated && (
        <Route
          exact
          path="/"
          component={LandingPage}
        />
      )}
      <Route
        exact
        path="/get-started/:step?"
        component={GettingStarted}
      />
      { isAuthenticated && (
        <Route
          exact
          path={['/', '/print/']}
          render={() => (
            <React.Fragment>
              <Home />
              <Route
                exact
                path="/print/"
                render={({ history, location }) => {
                  const hostID = new URLSearchParams(location.search).get('q')
                  const machineID = new URLSearchParams(location.search).get('m')

                  return (
                    <React.Suspense fallback={<div />}>
                      <PrintDialog
                        history={history}
                        match={{ params: { hostID, machineID } }}
                      />
                    </React.Suspense>
                  )
                }}
              />
            </React.Fragment>
          )}
        />
      )}
      { isAuthenticated && (
        <Route
          path={[
            '/m/:hostID/',
            '/q/:hostID/',
          ]}
          render={({ match }) => (
            <ConnectionFrame match={match}>
              <Route
                exact
                path={['/q/:hostID/', '/q/:hostID/print/']}
                component={QueuePage}
              />
              <Route exact path="/q/:hostID/jobs/:jobID/" component={JobPage} />

              <React.Suspense fallback={<div />}>
                <Route exact path="/q/:hostID/print/" component={PrintDialog} />
              </React.Suspense>

              <Route exact path="/q/:hostID/graphql-playground/" component={GraphQLPlayground} />

              <Route
                path="/m/:hostID/:machineID/manual-control/"
                component={ManualControlPage}
              />

              <React.Suspense fallback={<div />}>
                <Route
                  exact
                  path="/m/:hostID/:machineID/manual-control/swap-filament/:componentID"
                  component={FilamentSwapDialog}
                />
              </React.Suspense>

              <Route exact path="/m/:hostID/:machineID/terminal/" component={Terminal} />

              <Route
                exact
                path={[
                  '/m/:hostID/:machineID/config/',
                  '/m/:hostID/:machineID/config/machine/',
                ]}
                component={ConfigIndexPage}
              />
              <Route
                exact
                path={[
                  '/m/:hostID/:machineID/config/components/',
                  '/m/:hostID/:machineID/config/components/:componentID/',
                  '/m/:hostID/:machineID/config/components/:componentID/:verb',
                ]}
                component={ComponentsConfigPage}
              />
              <Route
                exact
                path={[
                  '/m/:hostID/:machineID/config/materials/',
                  '/m/:hostID/:machineID/config/materials/:materialID/',
                  '/m/:hostID/:machineID/config/materials/:materialID/:verb',
                ]}
                component={MaterialsConfigPage}
              />
              <Route
                exact
                path={[
                  '/m/:hostID/:machineID/config/plugins/',
                  '/m/:hostID/:machineID/config/plugins/:pluginID/',
                  '/m/:hostID/:machineID/config/plugins/:pluginID/:verb',
                ]}
                component={PluginsConfigPage}
              />
            </ConnectionFrame>
          )}
        />
      )}
    </Switch>
  )
}

export default Routes
