import React from 'react'
import { configure, addDecorator } from '@storybook/react'
// import {muiTheme} from 'storybook-addon-material-ui'
import ErrorBoundary from 'react-error-boundary'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import theme from '../src/theme'

// addDecorator(muiTheme())
addDecorator(story => (
  <ErrorBoundary>
    <ThemeProvider theme={theme}>
      <CssBaseline>
        {story()}
      </CssBaseline>
    </ThemeProvider>
  </ErrorBoundary>
))

const loadStories = () => {
  require('../src/pages/connected/queue/components/JobList.story.js')
  require('../src/pages/connected/frame/components/StatusDialog.story.js')
  require('../src/pages/connected/config/Config.story.js')
  require('../src/pages/connected/config/printerComponents/Index.story.js')
  require('../src/pages/connected/config/materials/Index.story.js')
}

configure(loadStories, module)
