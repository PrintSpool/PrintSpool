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

const JOBS_SUBSCRIPTION = gql`subscription {
  jobs {
    patches { op, path, from, value }
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
    >
      {
        withLiveData(({data, loading, error}) => {
          const jobs = data || []
          return (
            <JobList
              { ...{ loading, error, jobs} }
            />
          )
        })
      }
    </Subscription>
  </App>
)

export default enhance(Index)
