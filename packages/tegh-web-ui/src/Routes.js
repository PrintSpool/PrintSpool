import React, { useContext } from 'react'
import { Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'

import { UserDataContext } from './UserDataProvider'
import TeghApolloProvider from './printer/common/frame/higherOrderComponents/TeghApolloProvider'

import LandingPage from './onboarding/landingPage/LandingPage'
import BrowserUpgradeNotice from './onboarding/landingPage/BrowserUpgradeNotice'

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

const Routes = ({
  isBeaker = typeof DatArchive !== 'undefined',
}) => {
  const { isAuthorized, hosts } = useContext(UserDataContext)

  return (
    <BrowserRouter>
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
                  path="/p/:hostID/:printerID/manual-control/"
                  component={ManualControlPage}
                />
                <Route
                  exact
                  path="/p/:hostID/:printerID/manual-control/swap-filament/:componentID"
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
    </BrowserRouter>
  )
}

export default Routes
