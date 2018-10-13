import React from 'react'
import { compose, withContext } from 'recompose'
import PropTypes from 'prop-types'
// import {
//   Grid,
// } from '@material-ui/core'
import gql from 'graphql-tag'
import { LiveSubscription } from 'apollo-react-live-subscriptions'

import Header from '../frame/components/Header'
import JobList from './components/JobList'

import PrinterStatusGraphQL from '../shared/PrinterStatus.graphql'

const enhance = compose(
  withContext(
    {
      printerID: PropTypes.string,
    },
    () => ({ printerID: 'test_printer_id' }),
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

  # fragments
  ${PrinterStatusGraphQL}
`

const Index = ({ printerID = 'test_printer_id' }) => (
  <LiveSubscription
    variables={{
      printerID,
    }}
    subscription={JOBS_SUBSCRIPTION}
  >
    {
      ({ data, loading, error }) => {
        if (loading) {
          return (
            <div>
              Loading...
            </div>
          )
        }
        if (error) return <div>{ JSON.stringify(error) }</div>
        // console.log(data, loading, error, new Array(...arguments))

        const { jobs, printer } = data
        const { status } = printer

        return (
          <div>
            <Header printer={printer} />
            <main>
              <JobList
                {...{
                  loading,
                  error,
                  jobs,
                  status,
                  printerID,
                }}
              />
            </main>
          </div>
        )
      }
    }
  </LiveSubscription>
)

export default enhance(Index)
