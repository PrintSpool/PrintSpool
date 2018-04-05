import { CssBaseline } from 'material-ui'
import { Provider as ReduxProvider } from 'react-redux'
import { ApolloProvider } from 'react-apollo'
import { withStyles } from 'material-ui'

import createTeghStore from '../lib/redux'
import createApolloClient from '../lib/apollo'

import Drawer from '../components/Drawer'

export default (() => {
  /* force pages to be rendered in the browser for dev purposes */
  if (!process.browser) return () => <span key='ssrPlaceholder'/>

  const client = createApolloClient()
  const store = createTeghStore()

  const styles = theme => ({
    appFrame: {
      position: 'relative',
      display: 'flex',
      width: '100%',
      height: '100%',
      minHeight: '100vh',
    },
    flex: {
      flex: 1,
    },
  })




  const App = ({ children, classes }) => (
    <CssBaseline>
      <ApolloProvider client={ client }>
        <ReduxProvider store={ store }>
          <div>
            <div className={ classes.appFrame }>
              <Drawer />
              <div className={ classes.flex }>
                { children }
              </div>
            </div>
          </div>
        </ReduxProvider>
      </ApolloProvider>
    </CssBaseline>
  )

  return withStyles(styles, { withTheme: true })(App)
})()
