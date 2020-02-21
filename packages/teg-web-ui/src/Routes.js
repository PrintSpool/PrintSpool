import React, { useMemo } from 'react'
import { Route, Switch, Redirect } from 'react-router'

// import { UserDataContext } from './UserDataProvider'
import { useAuth0 } from './common/auth/auth0'

import LandingPage from './onboarding/landingPage/LandingPage'

import Home from './printer/home/Home'
import UserAccount from './printer/userAccount/UserAccount'
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
const UsersConfigPage = React.lazy(() => (
 import('./printer/config/users/Index.page')
))
const InvitesConfigPage = React.lazy(() => (
  import('./printer/config/invites/Index.page')
))

const AuthRedirect = () => {
  const redirectURL = useMemo(() => {
    const url = localStorage.getItem('redirectURL') || '/'
    localStorage.removeItem('redirectURL')
    return url
  }, [])

  return (
    <Redirect to={redirectURL} />
  )
}

const Routes = () => {
  const { isAuthenticated, loading, loginWithRedirect } = useAuth0()

  // console.log({ isAuthenticated, loading })

  if (loading) {
    return <div />
  }

  return (
    <>
      { !isAuthenticated && (
        <Switch>
          <Route
            exact
            path="/"
            component={LandingPage}
          />
          <Route
            exact
            path="/i/:inviteURLCode"
            render={({ match }) => (
              <Redirect to={`/get-started/3?invite=${match.params.inviteURLCode}`} />
            )}
          />
          <Route
            render={({ location }) => {
              localStorage.setItem('redirectURL', location.pathname + location.search)

              loginWithRedirect()

              return <div />
            }}
          />
        </Switch>
      )}
      { isAuthenticated && (
        <Switch>
          <Route
            exact
            path="/auth"
            component={AuthRedirect}
          />
          <Route
            exact
            path="/i/:inviteURLCode"
            render={({ match }) => (
              <Redirect to={`/get-started/3?invite=${match.params.inviteURLCode}`} />
            )}
          />
          <Route
            exact
            path="/get-started/:step?"
            component={GettingStarted}
          />
          <Route
            exact
            path="/account"
          >
            <UserAccount />
          </Route>
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
                    '/m/:hostID/:machineID/config/users/',
                    '/m/:hostID/:machineID/config/users/:userID/',
                    '/m/:hostID/:machineID/config/users/:userID/:verb',
                  ]}
                  component={UsersConfigPage}
                />
                <Route
                  exact
                  path={[
                    '/m/:hostID/:machineID/config/invites/',
                    '/m/:hostID/:machineID/config/invites/:inviteID/',
                    '/m/:hostID/:machineID/config/invites/:inviteID/:verb',
                  ]}
                  component={InvitesConfigPage}
                />
              </ConnectionFrame>
            )}
          />
        </Switch>
      )}
    </>
  )
}

export default Routes
