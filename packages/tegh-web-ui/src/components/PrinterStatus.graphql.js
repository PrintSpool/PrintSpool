import gql from 'graphql-tag'

const PrinterStatusGraphQL = gql`
  fragment PrinterStatus on Printer {
    status
    error {
      code
      message
    }
  }
`

export default PrinterStatusGraphQL
