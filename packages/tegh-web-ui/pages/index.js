import App from '../components/App'
import HeatersStatus from '../components/HeatersStatus'
import Submit from '../components/Submit'
import Log from '../components/Log'
import withData from '../lib/apollo'

export default withData(props => (
  <App>
    <HeatersStatus/>
    <Submit />
    <div style={{marginTop: 100}}/>
    <Log />
  </App>
))
