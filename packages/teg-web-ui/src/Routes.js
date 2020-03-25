import React, { useMemo, useEffect } from 'react'
import {
  Route,
  Switch,
  Redirect,
  useLocation,
} from 'react-router'

import { useAuth } from './common/auth'

import LandingPage from './onboarding/landingPage/LandingPage'
import PrivacyPolicy from './onboarding/privacyPolicy/PrivacyPolicy'

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
  const urlWithToken = new URL(document.location.origin + document.location.hash.replace(/#/, '?'))
  const params = Object.fromEntries(urlWithToken.searchParams)

  const googleJWT = params.id_token

  console.log({ googleJWT, params })

  // TODO: log the user in here

  const redirectURL = useMemo(() => {
    const url = localStorage.getItem('redirectURL') || '/'
    localStorage.removeItem('redirectURL')
    return url
  }, [])

  return (
    <Redirect to={redirectURL} />
  )
}

// const AuthRedirect = () => {
//   const url = new URL(document.location.origin + document.location.hash.replace(/#/, '?'))
//   const params = Object.fromEntries(url.searchParams)

//   const googleJWT = params.id_token

//   console.log({ googleJWT, params })

//   return (
//     <div />
//   )
// }

const Routes = () => {
  // const { isSignedIn, loading, loginWithRedirect } = useAuth0()
  const loading = false

  const { isSignedIn } = useAuth()

  // console.log({ isSignedIn, loading })

  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (loading) {
    return <div />
  }

  return (
    <Switch>
      <Route
        exact
        path="/privacy-policy"
        component={PrivacyPolicy}
      />
      <Route
        exact
        path="auth"
      >
        <AuthRedirect />
      </Route>
      { !isSignedIn && (
        <Route>
          <Switch>
            <Route
              exact
              path="/"
            >
              <LandingPage />
            </Route>
            <Route>
              TODO: Login Page
              {/* <LoginRegister /> */}
            </Route>
          </Switch>
        </Route>
      )}
      { isSignedIn && (
        <Route>
          <Switch>
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
        </Route>
      )}
    </Switch>
  )
}

export default Routes
