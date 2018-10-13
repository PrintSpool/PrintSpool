import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose, lifecycle } from 'recompose'
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  CardHeader,
  Switch,
  FormControlLabel,
  Button,
} from '@material-ui/core'

import withSpoolMacro from '../../higherOrderComponents/withSpoolMacro'

const heaterFragment = `
  id
  currentTemperature
  targetTemperature
`

const subscribeToHeaters = props => params => props.heaterQuery.subscribeToMore({
  document: gql`
      subscription heatersChanged {
        heatersChanged(printerID: "test_printer_id") {
          ${heaterFragment}
        }
      }
    `,
  variables: {
  },
})

const enhance = compose(
  withSpoolMacro,
  graphql(
    gql`query heaterQuery {
      printer(id: "test_printer_id") {
        id
        heaters {
          ${heaterFragment}
        }
      }
    }`,
    {
      name: 'heaterQuery',
      props: (props) => {
        const nextProps = {
          loading: props.heaterQuery.loading,
          error: props.heaterQuery.error,
          subscribeToHeaters: subscribeToHeaters(props),
        }
        if (nextProps.error) {
          setImmediate(() => {
            throw nextProps.error
          })
        }
        if (nextProps.loading || nextProps.error) return nextProps
        const heater = props.heaterQuery.printer.heaters
          .find(({ id }) => id === props.ownProps.id)
        return {
          ...nextProps,
          ...heater,
          isHeating: (heater.targetTemperature || 0) > 0,
        }
      },
    },
  ),
  lifecycle({
    componentWillMount() {
      this.props.subscribeToHeaters()
    },
  }),
)

const targetText = (targetTemperature) => {
  if (targetTemperature == null) return 'OFF'
  return `${targetTemperature}°C`
}

const TemperatureSection = ({
  id,
  currentTemperature,
  targetTemperature,
  isHeating,
  loading,
  error,
  spoolMacro,
  disabled,
}) => {
  if (loading) return <div>Loading</div>
  if (error) return <div>Error</div>
  const toggleEnabled = (event, val) => {
    spoolMacro({
      macro: 'toggleHeater',
      args: { [id]: val },
    })
  }
  return (
    <div>
      <Typography variant="display1">
        {currentTemperature.toFixed(1)}
°C /
        <sup style={{ fontSize: '50%' }}>
          {' '}
          {targetText(targetTemperature)}
        </sup>
      </Typography>
      <div style={{ marginTop: -3 }}>
        <FormControlLabel
          control={(
            <Switch
              checked={isHeating}
              onChange={toggleEnabled}
              disabled={disabled}
              aria-label="heating"
            />
)}
          label="Enable Heater"
        />
      </div>
    </div>
  )
}

export default enhance(TemperatureSection)
