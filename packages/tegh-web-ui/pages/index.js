import {
  Grid,
} from 'material-ui'

import App from '../components/App'
import PrintButton from '../components/PrintButton'

export default props => (
  <App>
    <Grid
      container
      spacing={24}
    >
      <Grid item xs={12}>
        <PrintButton form='printButton'/>
      </Grid>
    </Grid>
  </App>
)
