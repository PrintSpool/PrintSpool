import {
  Grid,
} from 'material-ui'

import App from '../components/App'
import AddJobButton from '../components/AddJobButton'

export default props => (
  <App>
    <Grid
      container
      spacing={24}
    >
      <Grid item xs={12}>
        <AddJobButton form='addJobButton'/>
      </Grid>
    </Grid>
  </App>
)
