// TODO: work in progress
import React, { useState, useContext } from 'react'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { useHistory } from 'react-router-dom'
import gql from 'graphql-tag'
import { Formik, Form } from 'formik'
import { createInvite } from 'graphql-things'
import QRCode from 'qrcode.react'
import base64url from 'base64url'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Typography,
} from '@material-ui/core'

// import Page2 from './Page2'

import { TegApolloContext } from '../../../../TegApolloProvider'

import FormikSchemaForm from '../../components/FormikSchemaForm/index'
import { useValidate } from '../../components/FormikSchemaForm/withValidate'
// import getDefaultValues from '../../components/FormikSchemaForm/getDefaultValues'

import Loading from '../../../../common/Loading'
import LoadingOverlay from '../../../../common/LoadingOverlay'

import useStyles from './CreateInviteDialogStyles'
import { useEffect } from 'react'

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

const initialWizard = {
  activeStep: 0,
  invite: null,
}

const enhance = Component => ({
  open,
}) => {
  const [wizard, updateWizard] = useState(initialWizard)

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

  const [addInviteMutation, { error }] = useMutation(addInviteGraphQL)

  const close = () => {
    history.push('../')
  }

  const onSubmit = async (values, bag) => {
    const nextInvite = await createInvite({
      identityKeys: {
        publicKey: tegApolloContext.peerIdentityPublicKey,
      },
    })

    const slug = base64url.fromBase64(nextInvite.code)

    const webAppURL = `${window.location.protocol}//${window.location.host}`
    const nextInviteURL = `${webAppURL}/i/${slug}`

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

      bag.setSubmitting(false)
    } else {
      close(bag)
    }
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
    onClose: close,
    onSubmit,
    schemaForm,
    wizard,
    updateWizard,
    validate,
    history,
  }


  return (
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
      {bag => (
        <Component {...nextProps} bag={bag} />
      )}
    </Formik>
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
  bag
}) => {
  const classes = useStyles()

  const { values, isSubmitting } = bag

  return (
    <Dialog
      open={open}
      onClose={() => onClose(bag)}
      aria-labelledby="create-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <Form>
        <LoadingOverlay loading={isSubmitting}>
          <DialogTitle id="create-dialog-title">
            Create an Invite Code
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
                <Typography variant="body1" paragraph className={classes.shareTitle}>
                  Share your 3D Printer with a friend
                </Typography>
                <div className={classes.qrCode}>
                  <QRCode
                    value={wizard.inviteURL}
                    size={300}
                  />
                </div>
                <TextField
                  label="Invite URL"
                  InputProps={{ classes: { input: classes.inviteURLField } }}
                  value={wizard.inviteURL}
                  fullWidth
                  multiline
                  onClick={event => event.target.select()}
                />
                <Typography variant="body2" paragraph className={classes.shareWarning}>
                  Please share the invite code before you leave this page. For security purposes the invite code will no longer be accessible after you leave this page.
                </Typography>
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
        </LoadingOverlay>
      </Form>
    </Dialog>
  )
}

export const Component = createInviteDialog
export default enhance(createInviteDialog)
