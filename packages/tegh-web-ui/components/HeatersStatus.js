import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const heaterFragment = `
  id
  currentTemperature
  targetTemperature
`

// const heatersQuery = gql`
//   query heaters {
//     allPrinters {
//       id
//     }
//   }
// `

const heatersQuery = gql`
  query heaters {
    printer(id: "test_printer_id") {
      heaters {
        ${heaterFragment}
      }
    }
  }
`

const heatersChangedSubscription = gql`
  subscription heatersChanged {
    heatersChanged(printerID: "test_printer_id") {
      ${heaterFragment}
    }
  }
`

const HeatersStatus = ({heaters}) => {
  if (heaters == null) return <div>Loading</div>
  return (
    <div>
      <h1>Heaters</h1>
      {
        heaters.map(({
          id,
          currentTemperature,
          targetTemperature
        }) => (
          <div>
            {id}: {currentTemperature}&deg;C
            {' / '}
            {targetTemperature ? `${targetTemperature}&deg;C` : 'OFF'}
          </div>
        ))
      }
    </div>
  )
}

export default graphql(heatersQuery, {
  props: (props) => props.data.printer
})(HeatersStatus)
// export default HeatersStatus
