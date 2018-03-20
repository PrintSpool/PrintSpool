import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose, lifecycle } from 'recompose'
// import withSubscription from '../higherOrderComponents/withSubscription'

const logFragment = `
  level
  source
  message
`

const maxLogLength = 100

const subscribeToLogEntries = props => params => {
  return props.logEntries.subscribeToMore({
    document:  gql`
      subscription logEntryCreated {
        logEntryCreated(printerID: "test_printer_id") {
          ${logFragment}
        }
      }
    `,
    variables: {
    },
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) {
          return prev
      }
      let { logEntries } = prev.printer
      logEntries = logEntries.concat(subscriptionData.data.logEntryCreated)
      if (logEntries.length > maxLogLength) {
        logEntries = logEntries.slice(-maxLogLength)
      }
      return {
        ...prev,
        printer: {
          logEntries,
        },
      }
    }
  })
}

const enhance = compose(
  graphql(
    gql`query logEntries {
      printer(id: "test_printer_id") {
        logEntries {
          ${logFragment}
        }
      }
    }`,
    {
      name: 'logEntries',
      props: props => {
        const { loading, printer } = props.logEntries
        return {
          loading,
          logEntries: printer == null ? [] : printer.logEntries,
          subscribeToLogEntries: subscribeToLogEntries(props),
        }
      },
    },
  ),
  lifecycle({
    componentWillMount() {
      this.props.subscribeToLogEntries()
    },
  }),
)

const Log = ({loading, logEntries}) => {
  if (loading) return <div>Loading</div>
  return (
    <div style={ {height: 300, width: '100%', overflowY: 'scroll'} }>
      {
        new Array(...logEntries).reverse().map(({
          level,
          source,
          message,
        }, index) => (
          <div key={index}>
            <span>{level} </span>
            <span>{source.toLowerCase()} </span>
            <span>{message}</span>
          </div>
        ))
      }
    </div>
  )
}

export default enhance(Log)
