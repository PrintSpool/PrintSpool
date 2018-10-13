import { CssBaseline } from '@material-ui/core'
import { Provider as ReduxProvider } from 'react-redux'
import { ApolloProvider } from 'react-apollo'
import { withStyles } from '@material-ui/core'

import createTeghStore from '../lib/redux'
import createTeghApolloClient from '../lib/createTeghApolloClient'

import Drawer from './Drawer'

export default (() => {
  const isNode = typeof navigator === 'undefined'

  /* force pages to be rendered in the browser for dev purposes */
  if (isNode) return () => <span key="ssrPlaceholder" />

  const client = createTeghApolloClient()
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
      <ApolloProvider client={client}>
        <ReduxProvider store={store}>
          <div>
            <div className={classes.appFrame}>
              <Drawer />
              <div className={classes.flex}>
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
