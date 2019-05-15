import React, { useCallback } from 'react'
import { withFormik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
import { useMutation } from 'react-apollo-hooks'

import {
  Button,
  Typography,
} from '@material-ui/core'

import gql from 'graphql-tag'

import { LiveSubscription } from '../../util/LiveSubscription'

import TerminalStyles from './TerminalStyles'

const GCODE_HISTORY_SUBSCRIPTION = gql`
  subscription DevicesSubscription($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        printers(printerID: $printerID) {
          id
          logEntries(sources: ["RX", "TX"], limit: 200) {
            id
            createdAt
            source
            level
            message
          }
        }
      }
    }
  }
`

const SPOOL_COMMANDS = gql`
  mutation spoolCommands($input: SpoolCommandsInput!) {
    spoolCommands(input: $input)
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
  // const classes = {}
  const { printerID } = match.params

  const spoolGCodeMutation = useMutation(SPOOL_COMMANDS, {
    variables: {
      input: {
        printerID,
        file: {
          name: 'terminal-input.ngc',
          content: values.gcode,
        },
      },
    },
  })

  const spoolGCode = useCallback((e) => {
    e.preventDefault()
    spoolGCodeMutation()
    resetForm()
  })

  return (
    <div className={classes.root}>
      <Form className={classes.inputRow} onSubmit={spoolGCode}>
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
        <LiveSubscription
          subscription={GCODE_HISTORY_SUBSCRIPTION}
          variables={{
            printerID,
          }}
        >
          {({ data, loading, error }) => {
            if (loading) {
              return <div />
            }

            if (error) {
              return (
                <div>
                  {JSON.stringify(error)}
                </div>
              )
            }

            return [...data.printers[0].logEntries].reverse().map(entry => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={entry.id} className={classes.terminalEntry}>
                <span className={classes.createdAt}>
                  {entry.createdAt}
                </span>
                {` ${entry.source}: `}
                {entry.message}
              </div>
            ))
          }}
        </LiveSubscription>
      </Typography>
    </div>
  )
}

export default enhance(Terminal)
