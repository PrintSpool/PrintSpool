import React from 'react'
import { compose } from 'recompose'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import { Formik, Form } from 'formik'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
} from '@material-ui/core'

import componentTypeNames from './componentTypeNames'
import Page1 from './Page1'
import Page2 from './Page2'

const CREATE_COMPONENT = gql`
  mutation createComponent($input: CreateConfigInput!) {
    createConfig(input: $input) {
      errors {
        dataPath
        message
      }
    }
  }
`

const enhance = compose(
  withRouter,
  Component => (props) => {
    const {
      history,
    } = props

    return (
      <Mutation
        mutation={CREATE_COMPONENT}
        update={(mutationResult) => {
          if (mutationResult.data != null) {
            const nextURL = history.location.pathname
              .replace(/[^/]+\/new/, '')
              .replace(/materials\/[^/]+\/$/, 'materials/')
            history.push(nextURL)
          }
        }}
      >
        {
          (create, { called, error }) => {
            if (error != null) return <div>{JSON.stringify(error)}</div>
            if (called) return <div />
            return (
              <Component
                create={create}
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
  'Configure the Component',
]

const createComponentDialog = ({
  printerID,
  open,
  history,
  create,
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
          return create({
            variables: {
              input: {
                printerID,
                collection: 'COMPONENT',
                schemaFormKey: values.componentType,
                model: values.model,
              },
            },
          })
        }
        bag.setTouched({})
        bag.setFieldValue('activeStep', values.activeStep + 1)
        bag.setSubmitting(false)
      }}
    >
      {({ values, setTouched, setFieldValue }) => (
        <Form>
          <DialogTitle id="create-dialog-title">
            Add a
            {' '}
            {
              values.componentType !== '' && (
                componentTypeNames
                  .find(c => c.value === values.componentType)
                  .label
              )
            }
            { values.componentType === '' && 'Component' }
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
