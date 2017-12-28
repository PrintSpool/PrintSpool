import App from '../components/App'
import HeatersStatus from '../components/HeatersStatus'
import Submit from '../components/Submit'
import withData from '../lib/apollo'

export default withData((props) => (
  <App>
    <HeatersStatus/>
    <Submit />
  </App>
))
