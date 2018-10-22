import React from 'react'
import { compose, withProps } from 'recompose'
// import {
//   Grid,
// } from '@material-ui/core'
import gql from 'graphql-tag'

import JobList from './components/JobList'

import withLiveData from '../shared/higherOrderComponents/withLiveData'

const JOBS_SUBSCRIPTION = gql`
  subscription {
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
  withLiveData,
)

const Index = ({
  printers,
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
      />
    </main>
  </div>
)

export default enhance(Index)
