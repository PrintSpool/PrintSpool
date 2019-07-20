import React from 'react'
import { compose, withState, withProps } from 'recompose'
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

import transformComponentSchema from '../../printerComponents/transformComponentSchema'

import componentTypeNames from './componentTypeNames'
import Page1 from './Page1'

import FormikSchemaForm from '../FormikSchemaForm/index'
import withValidate from '../FormikSchemaForm/withValidate'
import getDefaultValues from '../FormikSchemaForm/getDefaultValues'

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

const GET_SCHEMA_FORM = gql`
  query GetSchemaForm($input: SchemaFormQueryInput!) {
    schemaForm(input: $input) {
      id
      schema
      form
    }
  }
`

const enhance = compose(
  withState('wizard', 'updateWizard', {
    activeStep: 0,
    schemaForm: { schema: null },
  }),
  withRouter,
  withProps(ownProps => ({ schema: ownProps.wizard.schemaForm.schema })),
  withValidate,
  Component => (props) => {
    const {
      history,
    } = props

    return (
      <Mutation
        mutation={CREATE_COMPONENT}
        update={(mutationResult) => {
          if (mutationResult.data != null) {
            history.goBack()
          }
        }}
      >
        {
          (create, { called, error, client }) => {
            if (error != null) {
              throw error
            }

            if (called) return <div />

            return (
              <Component
                create={create}
                client={client}
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
  machineID,
  open,
  history,
  create,
  client,
  validate: validateSchemaForm,
  wizard,
  updateWizard,
  fixedListComponentTypes,
  devices,
  materials,
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
        componentType: '',
        model: {},
      }}
      validate={(values) => {
        const errors = {}

        if (!values.componentType) {
          errors.componentType = 'Required'
        }

        const modelErrors = validateSchemaForm(values.model)

        if (Object.keys(modelErrors).length === 0) {
          return errors
        }

        return {
          ...errors,
          model: modelErrors,
        }
      }}
      onSubmit={async (values, bag) => {
        const isLastPage = wizard.activeStep === STEPS.length - 1
        if (isLastPage) {
          return create({
            variables: {
              input: {
                machineID,
                collection: 'COMPONENT',
                schemaFormKey: values.componentType,
                model: values.model,
              },
            },
          })
        }

        const { data } = await client.query({
          query: GET_SCHEMA_FORM,
          // TODO: move variables to where query is called
          variables: {
            input: {
              collection: 'COMPONENT',
              machineID,
              schemaFormKey: values.componentType,
            },
          },
        })

        // bag.setTouched({})
        bag.resetForm({
          ...values,
          model: getDefaultValues(data.schemaForm),
        })
        updateWizard({
          activeStep: wizard.activeStep + 1,
          schemaForm: data.schemaForm,
        })
        // bag.setSubmitting(false)
      }}
    >
      {({ values, setTouched }) => (
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
            <Stepper activeStep={wizard.activeStep}>
              {
                STEPS.map((label, index) => (
                  <Step key={label} completed={index < wizard.activeStep}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))
              }
            </Stepper>
            {wizard.activeStep === 0 && (
              <Page1
                fixedListComponentTypes={fixedListComponentTypes}
              />
            )}
            {wizard.activeStep === 1 && (() => {
              const { schema, form } = wizard.schemaForm

              return (
                <FormikSchemaForm
                  schema={transformComponentSchema({
                    schema,
                    materials,
                    devices,
                  })}
                  form={form}
                  path="model."
                />
              )
            })()}
          </DialogContent>
          <DialogActions>
            {wizard.activeStep === 0 && (
              <Button onClick={() => history.goBack()}>
                Cancel
              </Button>
            )}
            {wizard.activeStep > 0 && (
              <Button
                onClick={() => {
                  setTouched({})
                  updateWizard({
                    activeStep: wizard.activeStep - 1,
                    schemaForm: { schema: null },
                  })
                }}
              >
                Back
              </Button>
            )}
            <Button type="submit" color="primary">
              {wizard.activeStep === STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  </Dialog>
)

export const Component = createComponentDialog
export default enhance(createComponentDialog)
