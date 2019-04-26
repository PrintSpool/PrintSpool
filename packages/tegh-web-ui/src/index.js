import React from 'react'
import ReactDOM from 'react-dom'
// import { ReduxSnackbar } from '@d1plo1d/material-ui-redux-snackbar'
// import { ApolloProvider } from 'react-apollo
import { install } from '@material-ui/styles'

install()

// eslint-disable-next-line import/first
import App from './App'

// eslint-disable-next-line no-undef
const wrapper = document.getElementById('tegh-app')
ReactDOM.render(<App />, wrapper)

export default App
