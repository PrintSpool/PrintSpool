import React from 'react'
import { compose, withProps } from 'recompose'
import gql from 'graphql-tag'

import JobList from './components/JobList'

import withLiveData from '../common/higherOrderComponents/withLiveData'

const JOBS_SUBSCRIPTION = gql`
  subscription JobQueueSubscription {
    live {
      patch { op, path, from, value }
      query {
        machines {
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
              machine {
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
  withLiveData,
)

const Index = ({
  machines,
  history,
  match,
  jobQueue: {
    jobs,
    name,
  },
}) => (
  <JobList
    hostID={match.params.hostID}
    history={history}
    name={name}
    jobs={jobs}
    machines={machines}
  />
)

export default enhance(Index)
