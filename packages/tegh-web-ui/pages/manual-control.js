import {
  Grid,
} from 'material-ui'

import App from '../components/App'
// import HeatersStatus from '../components/HeatersStatus'
// import Submit from '../components/Submit'
import Log from '../components/Log'
import Home from '../components/home/Home'
import XYJogButtons from '../components/jog/XYJogButtons'
import ZJogButtons from '../components/jog/ZJogButtons'
import HeaterControl from '../components/heaters/HeaterControl'

export default props => (
  // <App>
  //   <HeatersStatus/>
  //   <Submit />
  //   <div style={{marginTop: 100}}/>
  //   <Log />
  // </App>
  <App>
    <Grid
      container
      spacing={24}
    >
      <Grid item xs={12}>
        <Home />
      </Grid>
      <Grid item xs={12} sm={8}>
        <XYJogButtons form='xyJog' />
      </Grid>
      <Grid item xs={12} sm={4}>
        <ZJogButtons form='zJog' />
      </Grid>
      <Grid item xs={12}>
        <HeaterControl id='e0' isExtruder={true} name='Extruder 1' />
      </Grid>
      <Grid item xs={12}>
        <HeaterControl id='b' isExtruder={false} name='Bed' />
      </Grid>
    </Grid>
  </App>
)
