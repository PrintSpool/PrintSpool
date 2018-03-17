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
  withStyles,
} from 'material-ui'
import {
  Report
} from 'material-ui-icons'
import { Field, reduxForm, formValues } from 'redux-form'

import withSpoolMacro from '../higher_order_components/withSpoolMacro'

const styles = theme => ({
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
})

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
  withSpoolMacro,
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
  withStyles(styles),
  lifecycle({
    componentWillMount() {
      this.props.subscribeToStatus()
    }
  }),
)

const statusColor = status => {
  switch(status) {
    case 'READY':
      return '#1B5E20'
    case 'ERRORED':
    case 'ESTOPPED':
      return '#D50000'
    default:
      return '#FF5722'
  }
}

const EStopResetToggle = ({
  loading,
  status,
  spoolMacro,
  classes,
}) => {
  if (loading) return <div>Loading</div>
  const showEstop = status !== 'ERRORED' && status !== 'ESTOPPED'
  const onClick = () => {
    spoolMacro({ macro: showEstop ? 'eStop' : 'reset' })
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
          color={showEstop ? 'secondary' : 'primary'}
          raised
          onClick={onClick}
        >
          {
            showEstop &&
            <Report className={classes.leftIcon}/>
          }
          {showEstop ? 'EStop' : 'Reset'}
        </Button>
      </div>
    </div>
  )
}

export default enhance(EStopResetToggle)
