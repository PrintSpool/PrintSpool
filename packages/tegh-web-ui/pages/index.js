import { compose, withContext } from 'recompose'
import PropTypes from 'prop-types'
import {
  Grid,
} from 'material-ui'

import App from '../components/App'
import Header from '../components/Header'
import JobList from '../components/jobQueue/JobList'

import gql from 'graphql-tag'
import LiveSubscription from '../components/LiveSubscription'
import PrinterStatusGraphQL from '../components/PrinterStatus.graphql.js'

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
      patch { op, path, from, value }
      query {
        printer(id: $printerID) {
          name
          ...PrinterStatus
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
              id
              name
            }
          }
        }
      }
    }
  }

  # fragments
  ${PrinterStatusGraphQL}
`

const Index = ({ printerID = 'test_printer_id' }) => (
  <App>
    <LiveSubscription
      variables={{
        printerID,
      }}
      subscription={JOBS_SUBSCRIPTION}
    >
      {
        ({ data, loading, error }) => {
          if (loading) return <div/>
          if (error) return <div>{ JSON.stringify(error) }</div>
          console.log(JOBS_SUBSCRIPTION, PrinterStatusGraphQL)
          console.log(data, loading, error, new Array(...arguments))
          const { jobs, printer } = data
          const { status } = printer
          return (
            <div>
              <Header printer={printer}/>
              <main>
                <JobList
                  { ...{ loading, error, jobs, status, printerID } }
                />
              </main>
            </div>
          )
        }
      }
    </LiveSubscription>
  </App>
)

export default enhance(Index)
