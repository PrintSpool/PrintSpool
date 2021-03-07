import React from 'react'
import { Formik, Form } from 'formik'
import { gql } from '@apollo/client'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'

import transformComponentSchema from '../../printerComponents/transformComponentSchema'

import componentTypeNames from './componentTypeNames'
import Page1 from './Page1'

import FormikSchemaForm from '../FormikSchemaForm/index'
import getDefaultValues from '../FormikSchemaForm/getDefaultValues'

const GET_SCHEMA_FORM = gql`
  query GetSchemaForm($input: ComponentSchemaFormInput!) {
    componentSchemaForm(input: $input) {
      id
      schema
      form
    }
  }
`

const STEPS = [
  'Select a Type',
  'Configure the Component',
]

const createComponentDialog = ({
  machineID,
  open,
  error: externalError,
  history,
  create,
  client,
  validate: validateSchemaForm,
  wizard,
  updateWizard,
  fixedListComponentTypes,
  videoSources,
  devices,
  materials,
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
        componentType: '',
        model: {},
      }}
      validate={(values) => {
        const errors: any = {}

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
                componentType: values.componentType,
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
              type: values.componentType,
            },
          },
        })

        // bag.setTouched({})
        bag.resetForm({
          ...values,
          model: getDefaultValues(data.componentSchemaForm),
        })
        updateWizard({
          activeStep: wizard.activeStep + 1,
          schemaForm: data.componentSchemaForm,
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
                    videoSources,
                  })}
                  form={form}
                  path="model."
                  error={externalError}
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

export default createComponentDialog
