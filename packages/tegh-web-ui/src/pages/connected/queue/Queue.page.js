import React from 'react'
import { compose, withProps } from 'recompose'
// import {
//   Grid,
// } from '@material-ui/core'
import gql from 'graphql-tag'

import connectionFrame from '../frame/connectionFrame'
import Header from '../frame/components/Header'
import JobList from './components/JobList'

import PrinterStatusGraphQL from '../shared/PrinterStatus.graphql'

const JOBS_SUBSCRIPTION = gql`
  subscription {
    live {
      patch { op, path, from, value }
      query {
        printers {
          ...PrinterStatus
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

  # fragments
  ${PrinterStatusGraphQL}
`

const enhance = compose(
  withProps(() => ({
    subscription: JOBS_SUBSCRIPTION,
  })),
  connectionFrame,
)

const Index = ({
  printers,
  jobQueue: {
    jobs,
    name,
  },
}) => (
  <div>
    { /* TODO: multi-printer header or remove ESTOP/Printer Status for JobQueue page */ }
    <Header name={name} printer={printers[0]} />
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
