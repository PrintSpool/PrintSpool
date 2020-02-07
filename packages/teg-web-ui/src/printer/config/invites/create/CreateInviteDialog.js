// TODO: work in progress
import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { useHistory } from 'react-router-dom'
import gql from 'graphql-tag'
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

// import Page2 from './Page2'

import FormikSchemaForm from '../../components/FormikSchemaForm/index'
import { useValidate } from '../../components/FormikSchemaForm/withValidate'
// import getDefaultValues from '../../components/FormikSchemaForm/getDefaultValues'

import Loading from '../../../../common/Loading'

const addInviteGraphQL = gql`
  mutation addInvite($input: CreateConfigInput!) {
    createConfig(input: $input) {
      errors {
        dataPath
        message
      }
    }
  }
`

const getSchemaFormGraphQL = gql`
  query GetSchemaForm($input: SchemaFormQueryInput!) {
    schemaForm(input: $input) {
      id
      schema
      form
    }
  }
`

const STEPS = [
  'Setup',
  'Share the Invite Code',
]


const enhance = Component => ({
  open,
}) => {
  const [wizard, updateWizard] = useState({
    activeStep: 0,
  })

  const history = useHistory()

  const { data = {}, loading, error: queryError } = useQuery(getSchemaFormGraphQL, {
    // TODO: move variables to where query is called
    variables: {
      input: {
        collection: 'AUTH',
        schemaFormKey: 'invite',
      },
    },
  })

  const { schemaForm } = data
  const { schema } = schemaForm || {}

  const validateSchemaForm = useValidate({ schema })

  const validate = (values) => {
    const errors = {}

    const modelErrors = validateSchemaForm(values.model)

    if (Object.keys(modelErrors).length === 0) {
      return errors
    }

    return {
      ...errors,
      model: modelErrors,
    }
  }

  const [addInviteMutation, { called, error, client }] = useMutation(addInviteGraphQL)

  const onSubmit = async (values) => {
    const isLastPage = wizard.activeStep === STEPS.length - 1
    if (isLastPage) {
      await addInviteMutation({
        variables: {
          input: {
            collection: 'AUTH',
            schemaFormKey: 'invite',
            model: values.model,
          },
        },
      })

      history.push('../')

      return
    }

    // // bag.setTouched({})
    // bag.resetForm({
    //   ...values,
    //   model: getDefaultValues(data.schemaForm),
    // })
    updateWizard({
      ...wizard,
      activeStep: wizard.activeStep + 1,
    })
    // bag.setSubmitting(false)
  }

  if (error != null) {
    throw error
  }

  if (queryError != null) {
    throw queryError
  }

  if (loading) return <Loading />

  if (called) return <div />

  const nextProps = {
    open,
    onClose: () => history.push('../'),
    onSubmit,
    schemaForm,
    wizard,
    updateWizard,
    validate,
    history,
  }


  return (
    <Component {...nextProps} />
  )
}

const createInviteDialog = ({
  open,
  onClose,
  history,
  onSubmit,
  validate,
  wizard,
  schemaForm,
  updateWizard,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="create-dialog-title"
    maxWidth="md"
    fullWidth
  >
    <Formik
      initialValues={{
        package: '',
        model: {},
      }}
      validate={validate}
      onSubmit={onSubmit}
    >
      {({ values }) => (
        <Form>
          <DialogTitle id="create-dialog-title">
            Create an Invite Code
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
            {wizard.activeStep === 0 && (() => {
              const { schema, form } = schemaForm

              return (
                <FormikSchemaForm
                  schema={schema}
                  form={form}
                  path="model."
                  values={values}
                />
              )
            })()}
            {wizard.activeStep === 1 && (
              <div>
                TODO: display the QR CODE and Invite URL
              </div>
            )}
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
                  // setTouched({})
                  updateWizard({
                    ...wizard,
                    activeStep: wizard.activeStep - 1,
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

export const Component = createInviteDialog
export default enhance(createInviteDialog)
