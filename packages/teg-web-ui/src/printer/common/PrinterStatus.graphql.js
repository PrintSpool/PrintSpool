import gql from 'graphql-tag'

const PrinterStatusGraphQL = gql`
  fragment PrinterStatus on Machine {
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
