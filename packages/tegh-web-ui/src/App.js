import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import 'typeface-roboto'

import {
  CssBaseline,
  MuiThemeProvider,
} from '@material-ui/core'
import {
  ThemeProvider,
} from '@material-ui/styles'

import UserDataProvider from './UserDataProvider'
import Routes from './Routes'

import createTeghReduxStore from './createTeghReduxStore'
import theme from './theme'

export const store = createTeghReduxStore()

const App = () => (
  <MuiThemeProvider theme={theme}>
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <ReduxProvider store={store}>
          <UserDataProvider filePath="/tegh-user.json">
            <Routes />
            {
              // <ReduxSnackbar />
            }
          </UserDataProvider>
        </ReduxProvider>
      </CssBaseline>
    </ThemeProvider>
  </MuiThemeProvider>
)

export default App
