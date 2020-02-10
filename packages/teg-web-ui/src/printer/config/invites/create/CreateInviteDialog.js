// TODO: work in progress
import React, { useState, useContext } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { useHistory } from 'react-router-dom'
import gql from 'graphql-tag'
import { Formik, Form } from 'formik'
import { createInvite } from 'graphql-things'
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

import { TegApolloContext } from '../../../../TegApolloProvider'

import FormikSchemaForm from '../../components/FormikSchemaForm/index'
import { useValidate } from '../../components/FormikSchemaForm/withValidate'
// import getDefaultValues from '../../components/FormikSchemaForm/getDefaultValues'

import Loading from '../../../../common/Loading'

const addInviteGraphQL = gql`
  mutation addInvite($input: CreateInviteInput!) {
    createInvite(input: $input) {
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
  'Configure your Invite',
  'Share the Invite Code',
]


const enhance = Component => ({
  open,
}) => {
  const [wizard, updateWizard] = useState({
    activeStep: 0,
    invite: null,
  })

  const history = useHistory()
  const tegApolloContext = useContext(TegApolloContext)

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

  const [addInviteMutation, { called, error }] = useMutation(addInviteGraphQL)

  const onSubmit = async (values) => {
    console.log('SUBMITTING>???')
    const nextInvite = await createInvite({
      identityKeys: {
        publicKey: tegApolloContext.peerIdentityPublicKey,
      },
    })

    const webAppURL = `${window.location.protocol}//${window.location.host}`
    const nextInviteURL = `${webAppURL}/i/${nextInvite.code}`

    if (wizard.activeStep === 0) {
      await addInviteMutation({
        variables: {
          input: {
            publicKey: nextInvite.keys.publicKey,
            ...values.model,
          },
        },
      })

      updateWizard({
        ...wizard,
        activeStep: wizard.activeStep + 1,
        invite: nextInvite,
        inviteURL: nextInviteURL,
      })

      return
    }
    history.push('../')
  }

  if (error != null) {
    throw new Error(JSON.stringify(error))
  }

  if (queryError != null) {
    throw new Error(JSON.stringify(queryError))
  }

  if (loading) return <Loading />

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
        model: {
          isAdmin: false,
        },
      }}
      validate={validate}
      onSubmit={onSubmit}
    >
      {({ values, isSubmitting }) => (
        <Form>
          <DialogTitle id="create-dialog-title">
            Create an Invite Code
          </DialogTitle>
          <DialogContent style={{ minHeight: '12em' }}>
            { isSubmitting && (
              <Loading />
            )}
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
                  hideReadOnlyFields
                  values={values}
                />
              )
            })()}
            {wizard.activeStep === 1 && (
              <div>
                {wizard.inviteURL}
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
