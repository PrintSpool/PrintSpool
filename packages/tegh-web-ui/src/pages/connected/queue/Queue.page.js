import React from 'react'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import gql from 'graphql-tag'

import JobList from './components/JobList'

import withLiveData from '../shared/higherOrderComponents/withLiveData'

const JOBS_SUBSCRIPTION = gql`
  subscription JobQueueSubscription {
    live {
      patch { op, path, from, value }
      query {
        printers {
          id
          status
        }
        jobQueue {
          name
          jobs {
            id
            name
            quantity
            printsCompleted
            totalPrints
            isDone
            stoppedAt

            files {
              id
              printsQueued
            }

            tasks {
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
  }
`

const enhance = compose(
  withProps(() => ({
    subscription: JOBS_SUBSCRIPTION,
  })),
  connect(state => ({
    isUploadingJob: state.mutations.getIn(['createJob', 'isUploading'], false),
  })),
  withLiveData,
)

const Index = ({
  printers,
  isUploadingJob,
  jobQueue: {
    jobs,
    name,
  },
}) => (
  <div>
    <main>
      <JobList
        name={name}
        jobs={jobs}
        printers={printers}
        isUploadingJob={isUploadingJob}
      />
    </main>
  </div>
)

export default enhance(Index)
