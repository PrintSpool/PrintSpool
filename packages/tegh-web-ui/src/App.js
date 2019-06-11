import React, { useState } from 'react'
import 'typeface-roboto'

import '../node_modules/react-vis/dist/style.css'

import {
  CssBaseline,
  MuiThemeProvider,
} from '@material-ui/core'
import {
  ThemeProvider,
} from '@material-ui/styles'
import { SnackbarProvider } from 'notistack'

import UserDataProvider from './UserDataProvider'
import PrintFilesContext from './printer/printDialog/PrintFilesContext'
// import Loading from './common/Loading'
import Routes from './Routes'

import theme from './theme'
import './i18n'

const App = () => (
  <CssBaseline>
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <UserDataProvider filePath="/tegh-user.json">
            <PrintFilesContext.Provider value={useState()}>
              <React.Suspense fallback={<div />}>
                <Routes />
              </React.Suspense>
              {
                // <ReduxSnackbar />
              }
            </PrintFilesContext.Provider>
          </UserDataProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  </CssBaseline>
)

export default App
