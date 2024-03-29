import React, { useState } from 'react'
import 'typeface-roboto'

import 'react-vis/dist/style.css'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';

import { ErrorBoundary } from 'react-error-boundary'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter } from 'react-router-dom'
import { Switch, Route } from 'react-router'
import { ConfirmProvider } from 'material-ui-confirm'
import useRouter from 'use-react-router'
import Button from '@mui/material/Button'

import TegApolloProvider from './webrtc/TegApolloProvider'
import { AuthProvider } from './common/auth'

import PrintFilesContext from './printer/printPreview/PrintFilesContext'
// import Loading from './common/Loading'
import Routes from './Routes'
import Loading from './common/Loading'
import ErrorFallback from './common/ErrorFallback'

import theme from './theme'
import './i18n'


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


// console.log(process.env.NODE_ENV)

const RouterErrorBoundary = ({ children }) => {
  const { location } = useRouter()

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback as any}
      resetKeys={[location.pathname]}
    >
      {children}
    </ErrorBoundary>
  )
}

const App = () => {
  const notistackRef: any = React.createRef();
  const onClickDismiss = key => () => {
      notistackRef.current.closeSnackbar(key)
  }

  return (
    <CssBaseline>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <SnackbarProvider
            ref={notistackRef}
            maxSnack={3}
            action={(key) => (
              <Button
                onClick={onClickDismiss(key)}
                style={{ color: 'white' }}
              >
                  Dismiss
              </Button>
            )}
          >
            <ConfirmProvider
              defaultOptions={{
                confirmationButtonProps: { autoFocus: true }
              }}
            >
              <PrintFilesContext.Provider value={useState()}>
                <React.Suspense fallback={<Loading fullScreen />}>
                  <BrowserRouter>
                    <RouterErrorBoundary>
                      <AuthProvider>
                        <Switch>
                          <Route
                            path={[
                              '/:hostID/',
                              '/q/:hostID/',
                              '/',
                            ]}
                          >
                            <TegApolloProvider>
                              <Routes />
                            </TegApolloProvider>
                          </Route>
                          <Route>
                            <Routes />
                          </Route>
                        </Switch>
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
        </ThemeProvider>
      </StyledEngineProvider>
    </CssBaseline>
  );
}

export default App
