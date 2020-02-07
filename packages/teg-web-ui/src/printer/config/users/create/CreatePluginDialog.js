// TODO: work in progress
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

import Page1 from './Page1'

import FormikSchemaForm from '../../components/FormikSchemaForm/index'
import withValidate from '../../components/FormikSchemaForm/withValidate'
import getDefaultValues from '../../components/FormikSchemaForm/getDefaultValues'

const ADD_PLUGIN = gql`
  mutation addPlugin($input: CreateConfigInput!) {
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
        mutation={ADD_PLUGIN}
        update={(mutationResult) => {
          if (mutationResult.data != null) {
            history.push('../')
          }
        }}
      >
        {
          (addPlugin, { called, error, client }) => {
            if (error != null) {
              throw error
            }

            if (called) return <div />

            return (
              <Component
                addPlugin={addPlugin}
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
  'Select a Plugin',
  'Configure the Plugin',
]

const createComponentDialog = ({
  machineID,
  open,
  history,
  addPlugin,
  client,
  validate: validateSchemaForm,
  wizard,
  updateWizard,
  availablePackages,
}) => (
  <Dialog
    open={open}
    onClose={() => history.push('../')}
    aria-labelledby="create-dialog-title"
    maxWidth="md"
    fullWidth
  >
    <Formik
      initialValues={{
        package: '',
        model: {},
      }}
      validate={(values) => {
        const errors = {}

        if (!values.package) {
          errors.package = 'Required'
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
          return addPlugin({
            variables: {
              input: {
                machineID,
                collection: 'PLUGIN',
                schemaFormKey: values.package,
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
              machineID,
              collection: 'PLUGIN',
              schemaFormKey: values.package,
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
            Add
            {' '}
            {
              (values.package !== '' && values.package)
              || 'a Plugin'
            }
          </DialogTitle>
          <DialogContent style={{ minHeight: '12em' }}>
            {
              // console.log({ errors })
            }
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
              <Page1 availablePackages={availablePackages} />
            )}
            {wizard.activeStep === 1 && (() => {
              const { schema, form } = wizard.schemaForm

              return (
                <FormikSchemaForm
                  schema={schema}
                  form={form}
                  path="model."
                  values={values}
                />
              )
            })()}
          </DialogContent>
          <DialogActions>
            {wizard.activeStep === 0 && (
              <Button onClick={() => history.push('../')}>
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
