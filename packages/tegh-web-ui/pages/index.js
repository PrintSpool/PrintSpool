import { compose, withContext } from 'recompose'
import PropTypes from 'prop-types'
import {
  Grid,
} from 'material-ui'

import App from '../components/App'
import JobList from '../components/jobQueue/JobList'

import jsonpatch from 'json-patch'
import gql from 'graphql-tag'
import { Subscription } from 'react-apollo'

const enhance = compose(
  withContext(
    {
      printerID: PropTypes.string,
    },
    () => ({ printerID: 'test_printer_id'}),
  ),
)

const withLiveData = Component => {
  let state = null

  return ({ data, loading, error }) => {
    if (data != null) {
      console.log(data.jobs)
      const { query, patches } = data.jobs
      if (query != null) state = query
      if (patches != null) {
        patches.forEach(patch => state = jsonpatch.apply(state, patch))
      }
    }
    return (
      <Component
        data={state}
        loading={loading}
        error={error}
      />
    )
  }
}

const JOBS_SUBSCRIPTION = gql`subscription($printerID: ID!) {
  jobs(printerID: $printerID) {
    patches {
      ... on RFC4627Add { op, path, value }
      ... on RFC4627Remove { op, path }
      ... on RFC4627Replace { op, path, value }
      ... on RFC4627Move { op, from, path }
      ... on RFC4627Copy { op, from, path }
      ... on RFC4627Test { op, path, value }
    }
    query {
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
        name
        percentComplete
        startedAt
        status
        printer {
          name
        }
      }
    }
  }
}`

const Index = props => (
  <App>
    <Subscription
      subscription={JOBS_SUBSCRIPTION}
      variables={{printerID: 'test_printer_id'}}
    >
      {
        withLiveData(({data, loading, error}) => {
          const jobs = data || []
          return (
            <JobList
              { ...{ loading, error, jobs} }
              queuedJobs={ jobs.filter(job => job.status === 'QUEUED') }
              printingJobs={ jobs.filter(job => job.status === 'PRINTING') }
            />
          )
        })
      }
    </Subscription>
  </App>
)

export default enhance(Index)
