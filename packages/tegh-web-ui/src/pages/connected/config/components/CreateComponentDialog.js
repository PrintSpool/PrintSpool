import React from 'react'
import { compose, withProps } from 'recompose'
import { withRouter } from 'react-router'
import { SchemaForm } from 'react-schema-form'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
} from '@material-ui/core'

const DELETE_CONFIG = gql`
  mutation deleteConfig($input: DeleteConfigInput!) {
    deleteConfig(input: $input)
  }
`

const enhance = compose(
  withRouter,
  Component => (props) => {
    const {
      id,
      routingMode,
      printerID,
      history,
    } = props

    const input = {
      configFormID: id,
      routingMode,
    }

    if (routingMode === 'PRINTER') {
      input.printerID = printerID
    }

    return (
      <Mutation
        mutation={DELETE_CONFIG}
        variables={{ input }}
        update={(mutationResult) => {
          if (mutationResult.data != null) {
            const nextURL = history.location.pathname
              .replace(/[^/]+\/delete$/, '')
              .replace(/materials\/[^/]+\/$/, 'materials/')
            history.push(nextURL)
          }
        }}
      >
        {
          (deleteConfig, { called, error }) => {
            if (error != null) return <div>{JSON.stringify(error)}</div>
            if (called) return <div />
            return (
              <Component
                onDelete={deleteConfig}
                {...props}
              />
            )
          }
        }
      </Mutation>
    )
  },
)

const STEPS = [
  'Select a Type',
  'Configure the  Component',
]

const COMPONENT_TYPES = [
  {
    value: 'CONTROLLER',
    label: 'Controller',
  },
  {
    value: 'AXIS',
    label: 'Axis',
  },
  {
    value: 'TOOLHEAD',
    label: 'Toolhead',
  },
  {
    value: 'BUILD_PLATFORM',
    label: 'Build Platform',
  },
  {
    value: 'FAN',
    label: 'Fan',
  },
]

const createComponentDialog = ({
  open,
  history,
  onDelete,
  type,
  activeStep = 0
}) => (
  <Dialog
    open={open}
    onClose={() => history.goBack()}
    aria-labelledby="create-dialog-title"
    maxWidth="md"
    fullWidth
  >
    <DialogTitle  id="create-dialog-title">
      Add a Component
    </DialogTitle>
    <DialogContent>
      <Stepper activeStep={activeStep}>
        {
          STEPS.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))
        }
      </Stepper>
      <TextField
        id="standard-select-currency"
        select
        label="Please select the type of the component"
        value={''}
        onChange={() => null}
        margin="normal"
        fullWidth
      >
        {COMPONENT_TYPES.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </DialogContent>
    <DialogActions>
      {(activeStep < STEPS.length - 1) && (
        <Button onClick={() => history.goBack()}>
        Cancel
        </Button>
      )}
      <Button onClick={onDelete} color="primary">
        {activeStep === STEPS.length - 1 ? 'Finish' : 'Next'}
      </Button>
    </DialogActions>
  </Dialog>
)

export const Component = createComponentDialog
export default enhance(createComponentDialog)
