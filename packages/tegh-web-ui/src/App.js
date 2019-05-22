import React from 'react'
import 'typeface-roboto'

import '../node_modules/react-vis/dist/style.css'

import {
  CssBaseline,
  MuiThemeProvider,
} from '@material-ui/core'
import {
  ThemeProvider,
} from '@material-ui/styles'

import UserDataProvider from './UserDataProvider'
import Routes from './Routes'

import theme from './theme'

const App = () => (
  <CssBaseline>
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <UserDataProvider filePath="/tegh-user.json">
          <Routes />
          {
            // <ReduxSnackbar />
          }
        </UserDataProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  </CssBaseline>
)

export default App
