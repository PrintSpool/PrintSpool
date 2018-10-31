import gql from 'graphql-tag'

const PrinterStatusGraphQL = gql`
  fragment PrinterStatus on Printer {
    id
    name
    status
    error {
      code
      message
    }
  }
`

export default PrinterStatusGraphQL
