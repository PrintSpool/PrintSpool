import React from 'react'
import { configure, addDecorator } from '@storybook/react'
import withReduxForm from 'redux-form-storybook'
// import {muiTheme} from 'storybook-addon-material-ui'
import ErrorBoundary from 'react-error-boundary'
import {
  CssBaseline,
  MuiThemeProvider,
} from '@material-ui/core'
import theme from '../src/theme'

addDecorator(withReduxForm)
// addDecorator(muiTheme())
addDecorator(story => (
  <ErrorBoundary>
    <MuiThemeProvider theme={theme}>
      <CssBaseline>
        {story()}
      </CssBaseline>
    </MuiThemeProvider>
  </ErrorBoundary>
))

const loadStories = () => {
  require('../src/pages/connected/queue/components/JobList.story.js')
  require('../src/pages/connected/frame/components/StatusDialog.story.js')
  require('../src/pages/connected/config/Index.story.js')
  require('../src/pages/connected/config/printerComponents/Index.story.js')
  require('../src/pages/connected/config/materials/Index.story.js')
}

configure(loadStories, module)
