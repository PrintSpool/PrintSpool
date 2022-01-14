import React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { muiTheme } from 'storybook-addon-material-ui'
import StoryRouter from 'storybook-react-router'
import { SnackbarProvider } from 'notistack'
import { ConfirmProvider } from 'material-ui-confirm'

import theme from '../src/theme'

export const decorators = [
  (Story) => (
    <CssBaseline>
      <Story/>
    </CssBaseline>
  ),
	muiTheme([theme]),
  StoryRouter(),
  (Story) => (
    <SnackbarProvider maxSnack={3}>
      <ConfirmProvider>
        <div style={{ margin: '3em' }}><Story/></div>
      </ConfirmProvider>
    </SnackbarProvider>
  ),
]

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
