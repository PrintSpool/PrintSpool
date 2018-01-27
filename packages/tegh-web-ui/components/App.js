import { Reboot } from 'material-ui'
import { Provider as ReduxProvider } from 'react-redux'

import createTeghStore from '../lib/redux'
import createApolloClient from '../lib/apollo'

import { ApolloProvider } from 'react-apollo'
import Header from '../components/Header'
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
    },
  })

  const App = ({ children }) => (
    <Reboot>
      <ApolloProvider client={client}>
        <ReduxProvider store={store}>
          <div>
            <Drawer />
            <Header/>
            {children}
          </div>
        </ReduxProvider>
      </ApolloProvider>
    </Reboot>
  )

  return App
})()
