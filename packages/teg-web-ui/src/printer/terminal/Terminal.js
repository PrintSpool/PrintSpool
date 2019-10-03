import React from 'react'
import { withFormik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'

import {
  Button,
  Typography,
} from '@material-ui/core'

import gql from 'graphql-tag'

import useExecGCodes from '../_hooks/useExecGCodes'
import useLiveSubscription from '../_hooks/useLiveSubscription'

import TerminalStyles from './TerminalStyles'

const GCODE_HISTORY_SUBSCRIPTION = gql`
  subscription DevicesSubscription($machineID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        machines(machineID: $machineID) {
          id
          gcodeHistory(limit: 200) {
            id
            direction
            createdAt
            command
          }
        }
      }
    }
  }
`

const enhance = withFormik({
  mapPropsToValues: () => ({
    gcode: '',
  }),
})

const Terminal = ({
  match,
  values,
  resetForm,
}) => {
  const classes = TerminalStyles()
  const { machineID } = match.params

  const onSubmit = useExecGCodes((e) => {
    e.preventDefault()
    resetForm()

    return {
      machineID,
      gcodes: values.gcode,
    }
  })

  const {
    data,
    loading,
    error,
  } = useLiveSubscription(GCODE_HISTORY_SUBSCRIPTION, {
    variables: {
      machineID,
    },
  })

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }


  return (
    <div className={classes.root}>
      <Form className={classes.inputRow} onSubmit={onSubmit}>
        <Field
          className={classes.input}
          label="GCode"
          name="gcode"
          component={TextField}
        />
        <Button variant="contained" type="submit">
          Send
        </Button>
      </Form>
      <Typography
        variant="body2"
        className={classes.terminalHistory}
        component="div"
      >
        {
          [...data.machines[0].gcodeHistory].reverse().map(entry => (
            // eslint-disable-next-line react/no-array-index-key
            <div
              key={entry.id}
              className={[
                classes.terminalEntry,
                classes[entry.direction === 'TX' ? 'tx' : 'rx'],
              ].join(' ')}
            >
              {
                /*
                <span className={classes.createdAt}>
                  {entry.createdAt}
                </span>
                */
              }
              <span className={classes.direction}>
                {` ${entry.direction} `}
              </span>
              <span className={classes.command}>
                {entry.command}
              </span>
            </div>
          ))
        }
      </Typography>
    </div>
  )
}

export default enhance(Terminal)
