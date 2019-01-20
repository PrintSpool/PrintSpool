import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as ReduxProvider } from 'react-redux'
// import { ReduxSnackbar } from '@d1plo1d/material-ui-redux-snackbar'
// import { ApolloProvider } from 'react-apollo'
import {
  CssBaseline,
  MuiThemeProvider,
  // withStyles,
} from '@material-ui/core'

import Routes from './Routes'

import createTeghReduxStore from './createTeghReduxStore'
import theme from './theme'

export const store = createTeghReduxStore()

const Index = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline>
      <ReduxProvider store={store}>
        <Routes />
        {
          // <ReduxSnackbar />
        }
      </ReduxProvider>
    </CssBaseline>
  </MuiThemeProvider>
)

// eslint-disable-next-line no-undef
const wrapper = document.getElementById('@tegh/app')
ReactDOM.render(<Index />, wrapper)

export default Index
