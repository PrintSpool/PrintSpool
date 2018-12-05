import React from 'react'
import { compose, withProps } from 'recompose'
import { withRouter } from 'react-router'
import { SchemaForm } from 'react-schema-form'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
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
  MenuItem,
  Hidden,
} from '@material-ui/core'

import Page1 from './Page1'
import Page2 from './Page2'

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

const createComponentDialog = ({
  printerID,
  open,
  history,
  onSubmit,
}) => (
  <Dialog
    open={open}
    onClose={() => history.goBack()}
    aria-labelledby="create-dialog-title"
    maxWidth="md"
    fullWidth
  >
    <Formik
      initialValues={{
        activeStep: 0,
        componentType: '',
        model: {},
      }}
      validate={(values) => {
        const errors = {}
        if (!values.componentType) {
          errors.componentType = 'Required'
        }
        return errors
      }}
      onSubmit={(values, bag) => {
        const isLastPage = values.activeStep === STEPS.length - 1
        if (isLastPage) {
          return onSubmit(values, bag)
        }
        bag.setTouched({})
        bag.setFieldValue('activeStep', values.activeStep + 1)
        bag.setSubmitting(false)
      }}
    >
      {({ isSubmitting, values, setTouched, setFieldValue }) => (
        <Form>
          <DialogTitle id="create-dialog-title">
            Add a Component
          </DialogTitle>
          <DialogContent style={{ minHeight: '12em' }}>
            <Stepper activeStep={values.activeStep}>
              {
                STEPS.map((label, index) => (
                  <Step key={label} completed={index < values.activeStep}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))
              }
            </Stepper>
            {values.activeStep === 0 && (
              <Page1 />
            )}
            {values.activeStep === 1 && (
              <Page2
                printerID={printerID}
                values={values}
                setFieldValue={setFieldValue}
              />
            )}
          </DialogContent>
          <DialogActions>
            {values.activeStep === 0 && (
              <Button onClick={() => history.goBack()}>
                Cancel
              </Button>
            )}
            {values.activeStep > 0 && (
              <Button
                onClick={() => {
                  setTouched({})
                  setFieldValue('activeStep', values.activeStep - 1)
                }}
              >
                Back
              </Button>
            )}
            <Button type="submit" color="primary">
              {values.activeStep === STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  </Dialog>
)

export const Component = createComponentDialog
export default enhance(createComponentDialog)
