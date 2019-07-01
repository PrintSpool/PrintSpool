import React, { useState } from 'react'
import 'typeface-roboto'

import '../node_modules/react-vis/dist/style.css'

import {
  CssBaseline,
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
  </CssBaseline>
)

export default App
