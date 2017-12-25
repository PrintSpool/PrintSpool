import App from '../components/App'
import Submit from '../components/Submit'
import withData from '../lib/apollo'

export default withData((props) => (
  <App>
    <Submit />
  </App>
))
