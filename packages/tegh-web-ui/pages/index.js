import { compose, withContext } from 'recompose'
import PropTypes from 'prop-types'
import {
  Grid,
} from 'material-ui'

import App from '../components/App'
import JobList from '../components/jobQueue/JobList'

import gql from 'graphql-tag'
import LiveSubscription from '../components/LiveSubscription'

const enhance = compose(
  withContext(
    {
      printerID: PropTypes.string,
    },
    () => ({ printerID: 'test_printer_id'}),
  ),
)

const JOBS_SUBSCRIPTION = gql`
  subscription($printerID: ID!) {
    live {
      patches { op, path, from, value }
      query {
        printer(id: $printerID) {
          status
        }
        jobs {
          id
          name
          quantity
          tasksCompleted
          totalTasks
          status
          stoppedAt

          files {
            id
            status
          }

          tasks(excludeCompletedTasks: true) {
            id
            name
            percentComplete(digits: 1)
            startedAt
            status
            printer {
              name
            }
          }
        }
      }
    }
  }
`

const Index = props => (
  <App>
    <LiveSubscription
      variables={{
        printerID: 'test_printer_id'
      }}
      subscription={JOBS_SUBSCRIPTION}
    >
      {
        ({data, loading, error}) => {
          if (loading) return <div/>
          if (error) return <div>{ JSON.stringify(error) }</div>
          const jobs = data.jobs
          const status = data.printer.status
          return (
            <JobList
              { ...{ loading, error, jobs, status} }
            />
          )
        }
      }
    </LiveSubscription>
  </App>
)

export default enhance(Index)
