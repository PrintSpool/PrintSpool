import React, { useMemo, useEffect } from 'react'
import {
  Route,
  Switch,
  Redirect,
  useLocation,
} from 'react-router'

import { useAuth } from './common/auth'

const LandingPage = React.lazy(() => (
  import('./onboarding/landingPage/LandingPage')
))
const PrivacyPolicy = React.lazy(() => (
  import('./onboarding/privacyPolicy/PrivacyPolicy')
))
const LoginRegister = React.lazy(() => (
  import('./onboarding/loginRegister/LoginRegister')
))

const Home = React.lazy(() => (
  import('./printer/home/Home.page')
))
const HostPage = React.lazy(() => (
  import('./printer/host/Host.page')
))
const HostSettingsPage = React.lazy(() => (
  import('./printer/host/settings/HostSettings.page')
))
const UserAccount = React.lazy(() => (
  import('./printer/userAccount/UserAccount')
))
const Terminal = React.lazy(() => (
  import('./printer/terminal/Terminal.page')
))

const ConnectionFrame = React.lazy(() => (
  import('./printer/common/frame/ConnectionFrame')
))
const QueuePage = React.lazy(() => (
  import('./printer/jobQueue/JobQueue.page')
))
const PartPage = React.lazy(() => (
  import('./printer/part/Job.page')
))
const EditPartPage = React.lazy(() => (
  import('./printer/part/edit/EditPart.page')
))
const PrintHistoryPage = React.lazy(() => (
  import('./printer/part/printHistory/PrintHistory.page')
))
const StarredPage = React.lazy(() => (
  import('./printer/starred/Starred.page')
))

const ConfigIndexPage = React.lazy(() => (
  import('./printer/config/Config.page')
))
const ComponentsConfigPage = React.lazy(() => (
  import('./printer/config/printerComponents/PrinterComponents.page')
))
const MaterialsConfigPage = React.lazy(() => (
  import('./printer/config/materials/Materials.page')
))
const UsersConfigPage = React.lazy(() => (
  import('./printer/config/users/User.page')
))
const InvitesConfigPage = React.lazy(() => (
  import('./printer/config/invites/Invites.page')
))
const LatencyNotification = React.lazy(() => (
  import('./printer/common/LatencyNotification')
))
const AddPrinterPage = React.lazy(() => (
  import('./printer/addPrinter/AddPrinter.page')
))

const GettingStarted = React.lazy(() => (
  import('./onboarding/gettingStarted/GettingStarted')
))

const GraphQLPlayground = React.lazy(() => (
  import('./printer/graphqlPlayground/GraphQLPlayground')
))

// const PrintDialog = React.lazy(() => (
//   import('./printer/printDialog/PrintDialog')
// ))

const ManualControlPage = React.lazy(() => (
  import('./printer/manualControl/ManualControl.page')
))
const FilamentSwapDialog = React.lazy(() => (
  import('./printer/manualControl/filamentSwap/FilamentSwapDialog')
))

// const ConfigIndexPage = React.lazy(() => (
//  import('./printer/config/Config.page')
// ))
// const ComponentsConfigPage = React.lazy(() => (
//  import('./printer/config/printerComponents/PrinterComponents.page')
// ))
// const MaterialsConfigPage = React.lazy(() => (
//  import('./printer/config/materials/Materials.page')
// ))
// const UsersConfigPage = React.lazy(() => (
//  import('./printer/config/users/User.page')
// ))
// const InvitesConfigPage = React.lazy(() => (
//   import('./printer/config/invites/Invites.page')
// ))

const AuthRedirect = () => {
  // const urlWithToken = new URL(document.location.origin + document.location.hash.replace(/#/, '?'))
  // const params = Object.fromEntries(urlWithToken.searchParams)

  // const googleJWT = params.id_token

  // console.log({ googleJWT, params })

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

const Routes = () => {
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
              <LoginRegister />
            </Route>
          </Switch>
        </Route>
      )}
      { isSignedIn && (
        <Route exact path="/:m/:hostID/:machineID/graphql-playground/" component={GraphQLPlayground} />
      )}
      { isSignedIn && (
        <Route>
          <Switch>
            <Route
              exact
              path="/login"
            >
              <Redirect to="/" />
            </Route>
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
                  {/* <Route
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
                  /> */}
                </React.Fragment>
              )}
            />
            <Route
              path="/m/:hostID/"
              exact
            >
              <HostPage/>
            </Route>
            <Route
              path="/m/:hostID/settings"
              exact
            >
              <HostSettingsPage/>
            </Route>
            <Route
              path="/m/:hostID/add-printer"
              exact
            >
              <AddPrinterPage/>
            </Route>
            <Route
              path="/m/:hostID/:machineID/"
              render={({ match }) => (
                <ConnectionFrame match={match}>
                  <LatencyNotification />

                  <Route
                    exact
                    path="/:m/:hostID/:machineID/"
                    component={QueuePage}
                  />
                  <Route exact strict path="/:m/:hostID/:machineID/printing/:partID/" component={PartPage} />
                  <Route exact strict path="/:m/:hostID/:machineID/printing/:partID/print-history" component={PrintHistoryPage} />
                  <Route exact strict path="/:m/:hostID/:machineID/printing/:partID/settings" component={EditPartPage} />

                  <Route exact strict path="/:m/:hostID/:machineID/starred/" component={StarredPage} />

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
