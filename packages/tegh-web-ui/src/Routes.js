import React, { useContext } from 'react'
import { Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'

import { UserDataContext } from './UserDataProvider'

import LandingPage from './onboarding/landingPage/LandingPage'
import BrowserUpgradeNotice from './onboarding/landingPage/BrowserUpgradeNotice'
import GettingStarted from './onboarding/gettingStarted/GettingStarted'

import Home from './printer/home/Home'
import Terminal from './printer/terminal/Terminal'
import GraphQLPlayground from './printer/graphqlPlayground/GraphQLPlayground'

import ConnectionFrame from './printer/common/frame/ConnectionFrame'
import QueuePage from './printer/queue/Queue.page'
import JobPage from './printer/job/Job.page'
import ManualControlPage from './printer/manualControl/ManualControl.page'
import ConfigIndexPage from './printer/config/Index.page'
import ComponentsConfigPage from './printer/config/printerComponents/Index.page'
import MaterialsConfigPage from './printer/config/materials/Index.page'
import PluginsConfigPage from './printer/config/plugins/Plugins'

const Routes = ({
  isBeaker = typeof DatArchive !== 'undefined',
}) => {
  const { isAuthorized } = useContext(UserDataContext)

  return (
    <HashRouter>
      <Switch>
        { !isAuthorized && (
          <Route
            exact
            path={isBeaker ? '/' : ['/', '/get-started/:step?']}
            render={({ match, history }) => (
              <React.Fragment>
                <LandingPage />
                <BrowserUpgradeNotice
                  open={match.url.startsWith('/get-started/')}
                  onClose={() => history.push('/')}
                />
              </React.Fragment>
            )}
          />
        )}
        { isBeaker && (
          <Route
            exact
            path="/get-started/:step?"
            // TODO!QueuePage
            component={GettingStarted}
          />
        )}
        { isAuthorized && (
          <Route
            exact
            path="/"
            component={Home}
          />
        )}
        { isAuthorized && (
          <Route
            path="/:hostID/:page?"
            render={({ match }) => (
              <ConnectionFrame match={match}>
                <Route exact path="/:hostID/" component={QueuePage} />
                {/* <Route exact path="/:hostID/print" component={Print} /> */}
                <Route exact path="/:hostID/jobs/:jobID/" component={JobPage} />
                <Route exact path="/:hostID/:printerID/manual-control/" component={ManualControlPage} />
                <Route exact path="/:hostID/:printerID/terminal/" component={Terminal} />
                <Route exact path="/:hostID/graphql-playground/" component={GraphQLPlayground} />
                <Route
                  exact
                  path={[
                    '/:hostID/:printerID/config/',
                    '/:hostID/:printerID/config/printer/',
                  ]}
                  component={ConfigIndexPage}
                />
                <Route
                  exact
                  path={[
                    '/:hostID/:printerID/config/components/',
                    '/:hostID/:printerID/config/components/:componentID/',
                    '/:hostID/:printerID/config/components/:componentID/:verb',
                  ]}
                  component={ComponentsConfigPage}
                />
                <Route
                  exact
                  path={[
                    '/:hostID/:printerID/config/materials/',
                    '/:hostID/:printerID/config/materials/:materialID/',
                    '/:hostID/:printerID/config/materials/:materialID/:verb',
                  ]}
                  component={MaterialsConfigPage}
                />
                <Route
                  exact
                  path={[
                    '/:hostID/:printerID/config/plugins/',
                    '/:hostID/:printerID/config/plugins/:pluginID/',
                    '/:hostID/:printerID/config/plugins/:pluginID/:verb',
                  ]}
                  component={PluginsConfigPage}
                />
              </ConnectionFrame>
            )}
          />
        )}
      </Switch>
      { /* Dialogs */ }
      { isAuthorized && (
        <Route
          exact
          path={[
            '/:hostID/:printerID/manual-control/filament-swap',
          ]}
          component={
            <FilamentSwapDialog
              onClose={closeFilamentSwapDialog}
              open={filamentSwapDialogOpen}
              printer={printer}
              component={component}
            />
          }
        />
      )}
    </HashRouter>
  )
}

export default Routes
