import React, { useState } from 'react'
import 'typeface-roboto'

import '../node_modules/react-vis/dist/style.css'

import {
  CssBaseline,
} from '@material-ui/core'
import {
  ThemeProvider,
} from '@material-ui/styles'
import { ErrorBoundary } from 'react-error-boundary'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter } from 'react-router-dom'
import { Route } from 'react-router'
import { GraphQL, GraphQLProvider } from 'graphql-react'
import { ConfirmProvider } from 'material-ui-confirm'
import useRouter from 'use-react-router'

import TegApolloProvider from './TegApolloProvider'
import { AuthProvider } from './common/auth'

import PrintFilesContext from './printer/printDialog/PrintFilesContext'
// import Loading from './common/Loading'
import Routes from './Routes'
import Loading from './common/Loading'
import ErrorFallback from './common/ErrorFallback'

import theme from './theme'
import './i18n'

// Zero config GraphQL client that manages the cache.
const graphql = new GraphQL()

// console.log(process.env.NODE_ENV)

const RouterErrorBoundary = ({ children }) => {
  const { location } = useRouter()

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      resetKeys={[location.pathname]}
    >
      {children}
    </ErrorBoundary>
  )
}

const App = () => (
  <CssBaseline>
    <ThemeProvider theme={theme}>
      <GraphQLProvider graphql={graphql}>
        <SnackbarProvider maxSnack={3}>
          <ConfirmProvider>
            <PrintFilesContext.Provider value={useState()}>
              <React.Suspense fallback={<Loading fullScreen />}>
                <BrowserRouter>
                  <RouterErrorBoundary>
                    <AuthProvider>
                      <Route
                        path={[
                          '/m/:hostID/',
                          '/q/:hostID/',
                          '/',
                        ]}
                        render={() => (
                          <TegApolloProvider>
                            <Routes />
                          </TegApolloProvider>
                        )}
                      />
                    </AuthProvider>
                  </RouterErrorBoundary>
                </BrowserRouter>
              </React.Suspense>
              {
                // <ReduxSnackbar />
              }
            </PrintFilesContext.Provider>
          </ConfirmProvider>
        </SnackbarProvider>
      </GraphQLProvider>
    </ThemeProvider>
  </CssBaseline>
)

export default App
