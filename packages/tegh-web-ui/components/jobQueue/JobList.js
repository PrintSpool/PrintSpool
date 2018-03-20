import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose, lifecycle } from 'recompose'

import withPrinterID from '../../higherOrderComponents/withPrinterID'
import JobCard from './JobCard'

const heaterFragment = `
  id
  currentTemperature
  targetTemperature
`

const subscribeToJobList = props => params => {
  return props.jobListQuery.subscribeToMore({
    // TODO: job subscription
    document:  gql`
      subscription heatersChanged {
        heatersChanged(printerID: "test_printer_id") {
          ${heaterFragment}
        }
      }
    `,
    variables: {
    },
  })
}

const enhance = compose(
  graphql(
    gql`query jobListQuery {
      jobQueue {
        id
        name
        quantity
        tasksCompleted
        totalTasks
        status
        stoppedAt

        tasks(excludeCompletedTasks: true) {
          name
          precentComplete
          startedAt
          status
        }
      }
    }`,
    {
      name: 'jobListQuery',
      props: props => {
        const {
          loading,
          error,
          jobQueue
        } = props.jobListQuery
        return {
          loading,
          error,
          jobQueue,
          // subscribeToJobList: subscribeToJobList(props),
        }
      },
    },
  ),
  lifecycle({
    componentWillMount() {
      // this.props.subscribeToJobList()
    }
  }),
)

const JobList = ({
  loading,
  error,
  jobQueue,
}) => {
  console.log(jobQueue)
  if (loading) return <div>Loading</div>
  if (error) return <div>Error</div>

  return (
    <div>
      {
        jobQueue.map(job => (
          <JobCard key={job.id} {...job}/>
        ))
      }
    </div>
  )
}

export default enhance(JobList)
