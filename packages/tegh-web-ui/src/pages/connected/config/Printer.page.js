import React from 'react'
import { compose, withProps } from 'recompose'
import {
  Grid,
  Typography,
} from '@material-ui/core'
import Loader from 'react-loader-advanced'
import gql from 'graphql-tag'

import withLiveData from '../shared/higherOrderComponents/withLiveData'

import PrinterStatusGraphQL from '../shared/PrinterStatus.graphql'

import Header from '../frame/components/Header'

const CONFIG_SUBSCRIPTION = gql`
  subscription ConfigSubscription($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        printers {
          ...PrinterStatus
        }
      }
    }
  }

  # fragments
  ${PrinterStatusGraphQL}
`

const enhance = compose(
  withProps(ownProps => ({
    subscription: CONFIG_SUBSCRIPTION,
    variables: {
      printerID: ownProps.match.params.printerID,
    },
  })),
  withLiveData,
  withProps(({ singularPrinter }) => ({
    printer: singularPrinter[0],
  })),
)

const PrinterConfigPage = ({ config }) => (
  <main>

  </main>
)

export const Component = PrinterConfigPage
export default enhance(PrinterConfigPage)
