import React, { useState } from 'react'
import 'typeface-roboto'

import '../node_modules/react-vis/dist/style.css'

import {
  CssBaseline,
} from '@material-ui/core'
import {
  ThemeProvider,
} from '@material-ui/styles'
import ErrorBoundary from 'react-error-boundary'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter } from 'react-router-dom'
import { Route } from 'react-router'

import TegApolloProvider from './TegApolloProvider'

import { Auth0Provider } from './common/auth/auth0'
import UserDataProvider from './UserDataProvider'
import PrintFilesContext from './printer/printDialog/PrintFilesContext'
// import Loading from './common/Loading'
import Routes from './Routes'
import Loading from './common/Loading'
import ErrorFallback from './common/ErrorFallback'

import theme from './theme'
import './i18n'

const auth0Config = {
  domain: 'thirtybots-dev.eu.auth0.com',
  clientID: 'c0iSV8M7sXIJUkb3Q00XfopoC85SNmbm',
}

const App = () => (
  <CssBaseline>
    <ThemeProvider theme={theme}>
      <Auth0Provider
        domain={auth0Config.domain}
        client_id={auth0Config.clientID}
        redirect_uri={window.location.origin}
        // onRedirectCallback={onRedirectCallback}
      >
        <SnackbarProvider maxSnack={3}>
          <UserDataProvider filePath="/teg-user.json">
            <PrintFilesContext.Provider value={useState()}>
              <React.Suspense fallback={<Loading fullScreen />}>
                <BrowserRouter>
                  <Route
                    path={[
                      '/m/:hostID/',
                      '/q/:hostID/',
                      '/',
                    ]}
                    render={() => (
                      <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <TegApolloProvider>
                          <Routes />
                        </TegApolloProvider>
                      </ErrorBoundary>
                    )}
                  />
                </BrowserRouter>
              </React.Suspense>
              {
                // <ReduxSnackbar />
              }
            </PrintFilesContext.Provider>
          </UserDataProvider>
        </SnackbarProvider>
      </Auth0Provider>
    </ThemeProvider>
  </CssBaseline>
)

export default App
