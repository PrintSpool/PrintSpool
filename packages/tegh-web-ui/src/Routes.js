import React, { useContext } from 'react'
import { Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'

import { UserDataContext } from './UserDataProvider'
import TeghApolloProvider from './printer/common/frame/higherOrderComponents/TeghApolloProvider'

import LandingPage from './onboarding/landingPage/LandingPage'
import BrowserUpgradeNotice from './onboarding/landingPage/BrowserUpgradeNotice'
import GettingStarted from './onboarding/gettingStarted/GettingStarted'

import Home from './printer/home/Home'
import Terminal from './printer/terminal/Terminal'
import GraphQLPlayground from './printer/graphqlPlayground/GraphQLPlayground'
import PrintDialog from './printer/printDialog/PrintDialog'

import ConnectionFrame from './printer/common/frame/ConnectionFrame'
import QueuePage from './printer/queue/Queue.page'
import JobPage from './printer/job/Job.page'
import ManualControlPage from './printer/manualControl/ManualControl.page'
import ConfigIndexPage from './printer/config/Index.page'
import ComponentsConfigPage from './printer/config/printerComponents/Index.page'
import MaterialsConfigPage from './printer/config/materials/Index.page'
import PluginsConfigPage from './printer/config/plugins/Plugins'

import FilamentSwapDialog from './printer/manualControl/filamentSwap/FilamentSwapDialog'

const Routes = ({
  isBeaker = typeof DatArchive !== 'undefined',
}) => {
  const { isAuthorized, hosts } = useContext(UserDataContext)

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
            path={['/', '/print/']}
            render={() => (
              <React.Fragment>
                <Home />

                <Route
                  exact
                  path="/print/"
                  render={({ history, location }) => {
                    const hostID = new URLSearchParams(location.search).get('q')
                    const printerID = new URLSearchParams(location.search).get('p')

                    const host = hosts[hostID]

                    return (
                      <TeghApolloProvider hostIdentity={host && host.invite}>
                        <PrintDialog
                          history={history}
                          match={{ params: { hostID, printerID } }}
                        />
                      </TeghApolloProvider>
                    )
                  }}
                />
              </React.Fragment>
            )}
          />
        )}
        { isAuthorized && (
          <Route
            path={[
              '/p/:hostID/',
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
                <Route exact path="/q/:hostID/print/" component={PrintDialog} />
                <Route exact path="/q/:hostID/graphql-playground/" component={GraphQLPlayground} />

                <Route
                  exact
                  path="/p/:hostID/:printerID/manual-control/"
                  component={ManualControlPage}
                />
                <Route
                  exact
                  path="/p/:hostID/:printerID/manual-control/:componentID/swap-filament"
                  component={FilamentSwapDialog}
                />

                <Route exact path="/p/:hostID/:printerID/terminal/" component={Terminal} />

                <Route
                  exact
                  path={[
                    '/p/:hostID/:printerID/config/',
                    '/p/:hostID/:printerID/config/printer/',
                  ]}
                  component={ConfigIndexPage}
                />
                <Route
                  exact
                  path={[
                    '/p/:hostID/:printerID/config/components/',
                    '/p/:hostID/:printerID/config/components/:componentID/',
                    '/p/:hostID/:printerID/config/components/:componentID/:verb',
                  ]}
                  component={ComponentsConfigPage}
                />
                <Route
                  exact
                  path={[
                    '/p/:hostID/:printerID/config/materials/',
                    '/p/:hostID/:printerID/config/materials/:materialID/',
                    '/p/:hostID/:printerID/config/materials/:materialID/:verb',
                  ]}
                  component={MaterialsConfigPage}
                />
                <Route
                  exact
                  path={[
                    '/p/:hostID/:printerID/config/plugins/',
                    '/p/:hostID/:printerID/config/plugins/:pluginID/',
                    '/p/:hostID/:printerID/config/plugins/:pluginID/:verb',
                  ]}
                  component={PluginsConfigPage}
                />
              </ConnectionFrame>
            )}
          />
        )}
      </Switch>
    </HashRouter>
  )
}

export default Routes
