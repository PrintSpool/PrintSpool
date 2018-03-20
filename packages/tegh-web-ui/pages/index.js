import { compose, withContext } from 'recompose'
import PropTypes from 'prop-types'
import {
  Grid,
} from 'material-ui'

import App from '../components/App'
import JobList from '../components/jobQueue/JobList'
import AddJobButton from '../components/jobQueue/AddJobButton'

const enhance = compose(
  withContext(
    {
      printerID: PropTypes.string,
    },
    () => ({ printerID: 'test_printer_id'}),
  ),
)

const Index = props => (
  <App>
    <Grid
      container
      spacing={24}
    >
      <Grid item xs={12}>
        <JobList />
        <AddJobButton form='addJobButton' />
      </Grid>
    </Grid>
  </App>
)

export default enhance(Index)
