import React from 'react'
import 'typeface-roboto'

import { Route } from 'react-router'
import { BrowserRouter } from 'react-router-dom'

import {
  CssBaseline,
} from '@material-ui/core'
import {
  ThemeProvider,
} from '@material-ui/styles'

import { SnackbarProvider } from 'notistack'

import theme from '../theme'

import BrowserUpgradeNotice from '../onboarding/landingPage/BrowserUpgradeNotice'
import LandingPage from '../onboarding/landingPage/LandingPage'

import '../i18n'

const HTTPSite = () => (
  <CssBaseline>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <BrowserRouter>
          <Route
            path="/"
            component={LandingPage}
          />
          <Route
            path="/get-started/"
            render={({ history }) => (
              <BrowserUpgradeNotice
                open
                onClose={() => history.push('/')}
              />
            )}
          />
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  </CssBaseline>
)

export default HTTPSite
