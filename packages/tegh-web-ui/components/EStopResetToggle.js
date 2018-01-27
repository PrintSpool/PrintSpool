import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose, lifecycle } from 'recompose'
import styled from 'styled-components'
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
} from 'material-ui'
import { Field, reduxForm, formValues } from 'redux-form'

import withCreateTask from '../higher_order_components/withCreateTask'

const subscribeToStatus = props => params => {
  return props.statusQuery.subscribeToMore({
    document:  gql`
      subscription statusChanged {
        statusChanged(printerID: "test_printer_id") {
          id
          status
        }
      }
    `,
    variables: {
    },
  })
}

const enhance = compose(
  withCreateTask,
  graphql(
    gql`query statusQuery {
      printer(id: "test_printer_id") {
        id
        status
      }
    }`,
    {
      name: 'statusQuery',
      props: props => {
        const nextProps = {
          loading: props.statusQuery.loading,
          subscribeToStatus: subscribeToStatus(props),
        }
        if (nextProps.loading) return nextProps
        return {
          ...nextProps,
          status: props.statusQuery.printer.status,
        }
      },
    },
  ),
  lifecycle({
    componentWillMount() {
      this.props.subscribeToStatus()
    }
  }),
)

const statusColor = status => {
  switch(status) {
    case 'ready':
      return '#1B5E20'
    case 'errored':
    case 'estopped':
      return '#D50000'
    default:
      return '#FF5722'
  }
}

const EStopResetToggle = ({
  loading,
  status,
  createTask,
}) => {
  if (loading) return <div>Loading</div>
  const showEstop = status !== 'errored' && status !== 'estopped'
  const onClick = () => {
    createTask({ macro: showEstop ? 'eStop' : 'reset' })
  }
  return (
    <div>
      <div style={{display: 'inline-block', paddingTop: 8}}>
        <Typography type='button'>
          <span style={{ color: statusColor(status), marginRight: 10 }}>
            {status}
          </span>
        </Typography>
      </div>
      <div style={{display: 'inline-block'}}>
        <Button
          color="secondary"
          raised
          onClick={onClick}
        >
          {showEstop ? 'eStop' : 'Reset'}
        </Button>
      </div>
    </div>
  )
}

export default enhance(EStopResetToggle)
